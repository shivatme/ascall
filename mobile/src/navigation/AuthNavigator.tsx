import React, { JSX } from "react";

import LoginScreen from "../screens/LoginScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegisterScreen from "../screens/RegisterScreen";
// import WelcomeScreen from '../screens/WelcomeScreen';

export type AuthStackParamList = {
  Welcome: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = (): JSX.Element => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* <Stack.Screen
      name="Welcome"
      component={WelcomeScreen}
      options={{ headerShown: false }}
    /> */}
    <Stack.Screen
      name="LoginScreen"
      component={LoginScreen}
      // The `cardStyle` option belongs in `screenOptions`, not at the Screen level
    />
    <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;
