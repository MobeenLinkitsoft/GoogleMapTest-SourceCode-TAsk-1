import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import PlaceSearch from './PlaceSearch';

const RouteControls = ({
  origin,
  destination,
  isNavigating,
  onSetOrigin,
  onSetDestination,
  onStartNavigation,
  onStopNavigation,
  onShowRoute,
}) => {
  return (
    <View style={styles.container}>
      <PlaceSearch placeholder="Enter origin" onPlaceSelected={onSetOrigin} />

      <PlaceSearch
        placeholder="Enter destination"
        onPlaceSelected={onSetDestination}
      />

      {origin && destination && (
        <Button title={'Show Route'} onPress={onShowRoute} color={'blue'} />
      )}

      {origin && destination && (
        <Button
          title={isNavigating ? 'Stop Navigation' : 'Start Navigation'}
          onPress={isNavigating ? onStopNavigation : onStartNavigation}
          color={isNavigating ? 'red' : 'green'}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    zIndex: 1,
  },
});

export default RouteControls;
