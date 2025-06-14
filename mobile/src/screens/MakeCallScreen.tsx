import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import {
  useCameraPermission,
  useMicrophonePermission,
} from "react-native-vision-camera";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

interface Props {
  route: {
    params: {
      calleeId: string;
      roomId: string;
      contact: any;
    };
  };
}

export default function MakeCallScreen({ route }: Props) {
  const { calleeId, contact, roomId } = route.params;

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  const { hasPermission: camPerm, requestPermission: reqCamPerm } =
    useCameraPermission();
  const { hasPermission: micPerm, requestPermission: reqMicPerm } =
    useMicrophonePermission();

  const devices = useCameraDevices();
  const device = devices[1];

  useEffect(() => {
    setTimeout(() => {
      reqCamPerm();
      reqMicPerm();
    }, 300);
  }, []);

  const toggleMic = () => setMicEnabled((prev) => !prev);
  const toggleVideo = () => setVideoEnabled((prev) => !prev);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {contact ? (
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <MaterialIcons name="account-circle" size={48} color="#ef6c00" />
            <Text style={{ color: "#fff", fontSize: 24 }}>{contact.name}</Text>
            <Text style={{ color: "#fff", fontSize: 16 }}>
              {contact.phoneNumbers?.[0]?.number}
            </Text>
          </View>
        ) : (
          <View>
            <Text style={{ color: "#fff", fontSize: 24 }}>{calleeId}</Text>
          </View>
        )}
        <View style={styles.previewContainer}>
          {videoEnabled && camPerm && device ? (
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={true}
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

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
            }}
          >
            <TouchableOpacity
              onPress={toggleVideo}
              style={[
                styles.iconBtn,
                { backgroundColor: videoEnabled ? "#dedfde" : "#1e1e1e" },
              ]}
            >
              <MaterialIcons
                name={videoEnabled ? "videocam" : "videocam-off"}
                size={30}
                color={videoEnabled ? "#000" : "#fff"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleMic}
              style={[
                styles.iconBtn,
                { backgroundColor: micEnabled ? "#dedfde" : "#1e1e1e" },
              ]}
            >
              <MaterialCommunityIcons
                name={micEnabled ? "microphone" : "microphone-off"}
                size={30}
                color={micEnabled ? "#000" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.callBtn}>
          <MaterialCommunityIcons name="video-outline" size={30} color="#fff" />
          <Text style={styles.callBtnText}>Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050A0E",
    justifyContent: "space-between",
  },
  previewContainer: {
    // flex: 1,
    margin: 20,
    width: "70%",
    height: "60%",
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
    backgroundColor: "#2e2e2e",
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
