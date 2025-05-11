import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSocket } from "../context/SocketContext";

interface IncomingCallScreenProps {
  route: any;
  navigation: any;
}

function IncomingCallScreen({
  route,
  navigation,
}: IncomingCallScreenProps): JSX.Element {
  const { callState, acceptCall, rejectCall } = useSocket();

  const { callerId, roomId } = route.params;

  function acceptCallNow() {
    acceptCall(callerId, roomId);
    navigation.navigate("Call", { roomId });
  }

  function rejectCallNow() {
    rejectCall(callerId);
  }
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-around",
        backgroundColor: "#050A0E",
      }}
    >
      <View
        style={{
          padding: 35,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 14,
        }}
      >
        <Text
          style={{
            fontSize: 36,
            marginTop: 12,
            color: "#ffff",
          }}
        >
          {callerId} is calling..
        </Text>
      </View>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            acceptCallNow();
          }}
          style={{
            backgroundColor: "green",
            borderRadius: 30,
            height: 60,
            aspectRatio: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="call" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default IncomingCallScreen;
