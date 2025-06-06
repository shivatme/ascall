import { SimpleLineIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSocket } from "../context/SocketContext";

interface OutgoingCallScreenProps {
  route: any;
  navigation: any;
}

function OutgoingCallScreen({
  route,
  navigation,
}: OutgoingCallScreenProps): JSX.Element {
  const { callUser, endCall, socket, setCallState } = useSocket();

  const { calleeId, roomId } = route.params;

  function makeCall(calleeId: string) {
    callUser(calleeId, roomId);
  }

  function endCallNow() {
    endCall(calleeId);
    navigation.navigate("MakeCall");
  }

  useEffect(() => {
    makeCall(calleeId);
  }, [calleeId]);

  useEffect(() => {
    if (!socket) return;

    const handleCallAccepted = ({ roomId }: { roomId: string }) => {
      console.log("✅ Call accepted, navigating to CallScreen");
      setCallState({ state: "callAccepted" });
      navigation.navigate("Call", { roomId, isInitiator: true });
    };
    const handleCallRejected = ({ roomId }: { roomId: string }) => {
      setCallState({ state: null });
      console.log("✅ Call rejected, navigating to MakeCallScreen");
      navigation.navigate("MakeCall");
    };

    socket.on("call-accepted", handleCallAccepted);
    socket.on("call-rejected", handleCallRejected);

    return () => {
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket]);

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
            endCallNow();
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
