// src/navigation/CallNavigator.tsx

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SettingsScreen from "../screens/SettingsScreen";
import CallNavigator from "./CallNavigator";
import ContactsScreen from "../screens/ContactsScreen";

export type CallStackParamList = {
  CallNavigator: undefined;
  Setting: undefined;
  ContactsScreen: undefined;
};

const Stack = createNativeStackNavigator<CallStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="CallNavigator"
    >
      <Stack.Screen name="CallNavigator" component={CallNavigator} />
      <Stack.Screen name="Setting" component={SettingsScreen} />
      <Stack.Screen name="ContactsScreen" component={ContactsScreen} />
    </Stack.Navigator>
  );
}
