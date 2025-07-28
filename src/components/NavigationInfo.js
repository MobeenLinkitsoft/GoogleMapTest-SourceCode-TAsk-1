import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NavigationInfo = ({ eta, speed, nextTurn, maneuvers }) => {
  return (
    <View style={styles.container}>
      <View style={styles.infoBox}>
        <Text style={styles.speed}>{speed.toFixed(1)} km/h</Text>
        {eta && <Text style={styles.eta}>ETA: {eta}</Text>}
      </View>

      {nextTurn && (
        <View style={styles.nextTurnBox}>
          <Text style={styles.nextTurn}>Next: {nextTurn}</Text>
        </View>
      )}

      {maneuvers.length > 0 && (
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>Next Steps:</Text>
          {maneuvers.slice(0, 3).map((step, index) => (
            <Text key={index} style={styles.instruction}>
              {step.instruction} ({step.distance})
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  speed: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eta: {
    fontSize: 16,
  },
  nextTurnBox: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  nextTurn: {
    fontSize: 16,
  },
  instructionsBox: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  instructionsTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  instruction: {
    marginBottom: 3,
  },
});

export default NavigationInfo;