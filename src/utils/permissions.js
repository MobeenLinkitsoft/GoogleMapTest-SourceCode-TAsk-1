import { PermissionsAndroid, Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const checkLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need your location to provide navigation',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  } else {
    try {
      const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      
      if (status === RESULTS.GRANTED) {
        return true;
      } else if (status === RESULTS.DENIED) {
        const requestResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return requestResult === RESULTS.GRANTED;
      }
      return false;
    } catch (error) {
      console.warn('iOS location permission error:', error);
      return false;
    }
  }
};