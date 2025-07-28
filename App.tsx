import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NavigationScreen from './src/screens/Navigation';
import 'react-native-get-random-values';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Navigation" 
          component={NavigationScreen} 
          options={{ title: 'Google Navigation' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;