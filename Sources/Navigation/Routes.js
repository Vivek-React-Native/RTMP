import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  TransitionPresets,
} from '@react-navigation/stack';
import { Camera, Home } from '../Screens';

const Stack = createStackNavigator();

const Routes = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS,
        }}>
        <Stack.Screen name={'Home'} component={Home} />
        <Stack.Screen name={'RTMP'} component={Camera} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
