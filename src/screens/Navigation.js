import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapViewer from '../components/MapViewer';
import RouteControls from '../components/RouteControls';
import { checkLocationPermission } from '../utils/permissions';

const NavigationScreen = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showRoute, setShowRoute] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  return (
    <View style={styles.container}>
      <MapViewer
        origin={origin}
        destination={destination}
        isNavigating={isNavigating}
        setIsNavigating={setIsNavigating}
        showRoute={showRoute}
        setOrigin={setOrigin}
      />

      <RouteControls
        origin={origin}
        destination={destination}
        isNavigating={isNavigating}
        onSetOrigin={setOrigin}
        onSetDestination={setDestination}
        onStartNavigation={() => setIsNavigating(true)}
        onStopNavigation={() => setIsNavigating(false)}
        onShowRoute={() => setShowRoute(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default NavigationScreen;
