// src/navigation/CallNavigator.tsx

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MakeCallScreen from "../screens/MakeCallScreen";
import IncomingCallScreen from "../screens/IncomingCallScreen";
import OutgoingCallScreen from "../screens/OutgoingCallScreen";
import CallScreen from "../screens/CallScreen";
import HomeScreen from "../screens/HomeScreen";

export type CallStackParamList = {
  HomeScreen: undefined;
  IncomingCall: { callerId: string };
  OutgoingCall: { calleeId: string };
  Call: { roomId: string };
  Setting: undefined;
};

const Stack = createNativeStackNavigator<CallStackParamList>();

export default function CallNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="IncomingCall" component={IncomingCallScreen} />
      <Stack.Screen name="OutgoingCall" component={OutgoingCallScreen} />
      <Stack.Screen name="Call" component={CallScreen} />
    </Stack.Navigator>
  );
}
