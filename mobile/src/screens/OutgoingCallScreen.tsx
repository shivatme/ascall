import { MaterialIcons, SimpleLineIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSocket } from "../context/SocketContext";
import {
  Camera,
  useCameraDevices,
  useCameraPermission,
} from "react-native-vision-camera";
import { useFocusEffect } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { useCallback } from "react";

interface OutgoingCallScreenProps {
  route: any;
  navigation: any;
  videoEnabled: boolean;
  micEnabled: boolean;
  contact: any;
}

function OutgoingCallScreen({
  route,
  navigation,
}: OutgoingCallScreenProps): JSX.Element {
  const { callUser, endCall, socket, setCallState } = useSocket();

  const { calleeId, roomId, contact, videoEnabled, micEnabled } = route.params;
  const { hasPermission: camPerm, requestPermission: reqCamPerm } =
    useCameraPermission();
  function makeCall(calleeId: string) {
    callUser(calleeId, roomId);
  }
  const [isVisionCameraActive, setVisionCameraActive] = useState(true);
  function endCallNow() {
    endCall(calleeId);
    navigation.goBack();
  }
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true; // Prevent default behavior (go back)
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [])
  );

  useEffect(() => {
    makeCall(calleeId);
  }, [calleeId]);

  useEffect(() => {
    if (!socket) return;

    const handleCallAccepted = ({ roomId }: { roomId: string }) => {
      setVisionCameraActive(false);
      setCallState({ state: "callAccepted" });
      navigation.navigate("CallScreen", {
        roomId,
        isInitiator: true,
        calleeId,
        videoEnabled,
        micEnabled,
      });
    };
    const handleCallRejected = ({ roomId }: { roomId: string }) => {
      setCallState({ state: null });
      navigation.navigate("MakeCallScreen", { calleeId, roomId });
    };

    socket.on("call-accepted", handleCallAccepted);
    socket.on("call-rejected", handleCallRejected);

    return () => {
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket]);
  useEffect(() => {
    setVisionCameraActive(true);
    navigation.setOptions({
      gestureEnabled: false,
      headerBackVisible: false,
    });
    return () => {
      setVisionCameraActive(false);
    };
  }, []);
  const devices = useCameraDevices();
  const device = devices[1];
  return (
    <View
      style={{
        flex: 1,
        // justifyContent: "space-around",
        backgroundColor: "#050A0E",
      }}
    >
      <View style={styles.previewContainer}>
        {videoEnabled && camPerm && device ? (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isVisionCameraActive}
          />
        ) : (
          <View style={styles.videoOffContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {calleeId?.[0]?.toUpperCase() || "U"}
              </Text>
            </View>
            <View style={styles.offTextRow}>
              <MaterialIcons
                name="videocam-off"
                color="#fff"
                size={22}
                style={{ marginRight: 10 }}
              />
              <Text style={{ color: "#fff" }}>Video Off</Text>
            </View>
          </View>
        )}
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "space-around",
          alignItems: "center",
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
            Calling {contact?.name || calleeId}
          </Text>

          <Text
            style={{
              fontSize: 36,
              marginTop: 12,
              color: "#ffff",
              letterSpacing: 2,
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
    flex: 1,
  },
  previewContainer: {
    // flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  videoOffContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: "#FF5722",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  offTextRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  iconBtn: {
    width: 65,
    height: 65,
    // backgroundColor: "#dedfde",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#0277BD",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  callBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default OutgoingCallScreen;
