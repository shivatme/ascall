import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSocket } from "../context/SocketContext";
import { CommonActions } from "@react-navigation/native";

interface IncomingCallScreenProps {
  route: any;
  navigation: any;
}

function IncomingCallScreen({
  route,
  navigation,
}: IncomingCallScreenProps): JSX.Element {
  const { callState, acceptCall, rejectCall, setCallState } = useSocket();

  const { callerId, roomId, from } = route.params;
  console.log(from);
  function acceptCallNow() {
    acceptCall(callerId, roomId);
    setCallState({ state: "callAccepted" });

    navigation.navigate("CallScreen", { roomId });
  }

  function rejectCallNow() {
    rejectCall(callerId);

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "HomeScreen" }],
      })
    );
  }

  useEffect(() => {
    if (callState.state === null) {
      // console.log("Call ended");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "HomeScreen" }],
        })
      );
    }
  }, [callState]);
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
          {from || callerId} is calling..
        </Text>
      </View>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          gap: 40,
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

        <TouchableOpacity
          onPress={() => {
            rejectCallNow();
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

export default IncomingCallScreen;
