// src/navigation/CallNavigator.tsx

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SettingsScreen from "../screens/SettingsScreen";
import CallNavigator from "./CallNavigator";
import ContactsScreen from "../screens/ContactsScreen";
import HomeScreen from "../screens/HomeScreen";
import { View } from "react-native";

export type CallStackParamList = {
  HomeScreen: undefined;
  CallNavigator: undefined;
  SettingScreen: undefined;
  ContactsScreen: undefined;
};

const Stack = createNativeStackNavigator<CallStackParamList>();

export default function AppNavigator() {
  return (
    <View style={{ backgroundColor: "#050A0E", flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="CallNavigator" component={CallNavigator} />
        <Stack.Screen name="SettingScreen" component={SettingsScreen} />
        <Stack.Screen name="ContactsScreen" component={ContactsScreen} />
      </Stack.Navigator>
    </View>
  );
}
