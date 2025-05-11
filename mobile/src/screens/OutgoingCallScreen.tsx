import { SimpleLineIcons } from "@expo/vector-icons";
import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

interface OutgoingCallScreenProps {
  calleeId?: string;
}

function OutgoingCallScreen({
  calleeId,
}: OutgoingCallScreenProps): JSX.Element {
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
            fontSize: 16,
            color: "#D0D4DD",
          }}
        >
          Calling to...
        </Text>

        <Text
          style={{
            fontSize: 36,
            marginTop: 12,
            color: "#ffff",
            letterSpacing: 6,
          }}
        >
          {calleeId}
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
            //   setType('JOIN');
            //   otherUserId.current = null;
          }}
          style={{
            backgroundColor: "#FF5D5D",
            borderRadius: 30,
            height: 60,
            aspectRatio: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SimpleLineIcons name="call-end" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default OutgoingCallScreen;
