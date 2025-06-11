// src/navigation/CallNavigator.tsx

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MakeCallScreen from "../screens/MakeCallScreen";
import IncomingCallScreen from "../screens/IncomingCallScreen";
import OutgoingCallScreen from "../screens/OutgoingCallScreen";
import CallScreen from "../screens/CallScreen";

export type CallStackParamList = {
  MakeCallScreen: undefined;
  IncomingCallScreen: { callerId: string };
  OutgoingCallScreen: { calleeId: string };
  CallScreen: { roomId: string };
};

const Stack = createNativeStackNavigator<CallStackParamList>();

export default function CallNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MakeCallScreen" component={MakeCallScreen} />
      <Stack.Screen name="IncomingCallScreen" component={IncomingCallScreen} />
      <Stack.Screen name="OutgoingCallScreen" component={OutgoingCallScreen} />
      <Stack.Screen name="CallScreen" component={CallScreen} />
    </Stack.Navigator>
  );
}
