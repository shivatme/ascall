import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

interface IncomingCallScreenProps {
  calleeId?: string;
  route: any;
}

function IncomingCallScreen({
  calleeId,
  route,
}: IncomingCallScreenProps): JSX.Element {
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
          {calleeId} is calling..
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
            // setType("WEBRTC_ROOM");
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
