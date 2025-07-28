import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline ,PROVIDER_DEFAULT} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import NavigationInfo from './NavigationInfo';

const MapViewer = ({
  origin,
  destination,
  isNavigating,
  setIsNavigating,
  showRoute,
  setOrigin
}) => {
  const mapRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const watchIdRef = useRef(null);
  const [coordinates, setCoordinates] = useState([]);
  const [eta, setEta] = useState(null);
  const [maneuvers, setManeuvers] = useState([]);
  const [nextTurnDistance, setNextTurnDistance] = useState(null);
  const [distanceTraveled, setDistanceTraveled] = useState(0);

  const [navigationData, setNavigationData] = useState({
    eta: null,
    maneuvers: [],
    speed: 0,
    nextTurn: null,
    distanceTraveled: 0,
  });

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        centerMap(latitude, longitude);
      },
      error => console.log('Location error:', error),
      { enableHighAccuracy: true },
    );
  }, []);

  useEffect(() => {
    if (isNavigating) {
      startNavigation();
    } else {
      stopNavigation();
    }

    if (showRoute) {
      getRouteDirections();
    }
  }, [isNavigating, showRoute]);

  const centerMap = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  const getRouteDirections = async () => {
    if (!origin || !destination) return;

    try {
      const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=AIzaSyAfyaSB4Rgd0p9PECIrPHz0Z-FVUnkq-FU`;
      const response = await fetch(apiUrl);
      const json = await response.json();

      if (json.routes.length) {
        const points = json.routes[0].overview_polyline.points;
        const steps = json.routes[0].legs[0].steps;
        const routeCoordinates = decodePolyline(points);

        setRouteCoordinates(routeCoordinates);

        setEta(json.routes[0].legs[0].duration.text);

        const instructions = steps.map(step => ({
          instruction: step.html_instructions.replace(/<[^>]*>?/gm, ''),
          distance: step.distance.text,
          startLocation: step.start_location,
        }));
        setManeuvers(instructions);

        if (mapRef.current) {
          mapRef.current.fitToCoordinates(routeCoordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const decodePolyline = encoded => {
    const poly = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      const point = {
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      };
      poly.push(point);
    }
    return poly;
  };

  const startNavigation = () => {
    if (coordinates.length > 0) {
      setIsNavigating(true);

      if (watchIdRef.current) {
        Geolocation.clearWatch(watchIdRef.current);
      }

      setDistanceTraveled(0);
      lastPositionRef.current = currentLocation;

      watchIdRef.current = Geolocation.watchPosition(
        position => {
          const { latitude, longitude, speed } = position.coords;
          const newLocation = { latitude, longitude };

          setCurrentLocation(newLocation);
          setCurrentSpeed(speed || 0);

          if (lastPositionRef.current) {
            const distance = calculateDistance(
              lastPositionRef.current,
              newLocation,
            );
            setDistanceTraveled(prev => prev + distance);
          }
          lastPositionRef.current = newLocation;

          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            });
          }

          const offRouteDistance = calculateDistanceToRoute(
            newLocation,
            coordinates,
          );
          if (offRouteDistance > 50) {
            setOrigin(newLocation);
            getRouteDirections();
          }

          if (maneuvers.length > 0) {
            const nextTurnInfo = getNextTurnInfo(newLocation, maneuvers);
            setNextTurnDistance(nextTurnInfo.distance);
          }
        },
        error => console.error(error),
        {
          enableHighAccuracy: true,
          distanceFilter: 5,  
          interval: 1000, 
          fastestInterval: 500, 
        },
      );
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    if (watchIdRef.current) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371e3;  
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const calculateDistanceToRoute = (point, route) => {
    let minDistance = Number.MAX_VALUE;
    for (const routePoint of route) {
      const distance = calculateDistance(point, routePoint);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
    return minDistance;
  };

  const getNextTurnInfo = (currentLocation, maneuvers) => {
    let closestManeuver = null;
    let minDistance = Number.MAX_VALUE;

    for (const maneuver of maneuvers) {
      const distance = calculateDistance(currentLocation, {
        latitude: maneuver.startLocation.lat,
        longitude: maneuver.startLocation.lng,
      });

      if (distance < minDistance && distance > 10) {
        minDistance = distance;
        closestManeuver = maneuver;
      }
    }

    return {
      instruction: closestManeuver?.instruction || 'Continue straight',
      distance:
        minDistance < 1000
          ? `${Math.round(minDistance)}m`
          : `${(minDistance / 1000).toFixed(1)}km`,
    };
  };

  return (
    <>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}
        provider={PROVIDER_DEFAULT}
        followsUserLocation={isNavigating}
      >
        {origin && <Marker coordinate={origin} pinColor="blue" />}
        {destination && <Marker coordinate={destination} pinColor="red" />}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#0000FF"
            strokeWidth={4}
          />
        )}
      </MapView>

      {isNavigating && (
        <NavigationInfo
          eta={eta}
          speed={navigationData.speed}
          nextTurn={navigationData.nextTurn}
          nextTurnDistance={nextTurnDistance}
          maneuvers={maneuvers}
        />
      )}

      
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapViewer;
