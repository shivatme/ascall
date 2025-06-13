import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import {
  useCameraPermission,
  useMicrophonePermission,
} from "react-native-vision-camera";

interface MakeCallScreenProps {
  navigation: any;
  route: {
    params: {
      calleeId: string;
      roomId: string;
    };
  };
}

export default function MakeCallScreen({ route }: MakeCallScreenProps) {
  const { calleeId } = route.params;

  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const {
    hasPermission: hasMicPermission,
    requestPermission: requestMicPermission,
  } = useMicrophonePermission();

  const devices = useCameraDevices();
  const device = devices.front;

  useEffect(() => {
    requestCameraPermission();
    requestMicPermission();
  }, []);

  const toggleMic = () => setMicEnabled((prev) => !prev);
  const toggleVideo = () => setVideoEnabled((prev) => !prev);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.callBox}>
        <Text style={styles.label}>Calling {calleeId}</Text>

        <TouchableOpacity style={styles.callBtn} onPress={toggleMic}>
          <Text style={styles.callBtnText}>
            {micEnabled ? "Mute Mic" : "Unmute Mic"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.callBtn} onPress={toggleVideo}>
          <Text style={styles.callBtnText}>
            {videoEnabled ? "Turn Off Video" : "Turn On Video"}
          </Text>
        </TouchableOpacity>
      </View>

      {videoEnabled && device && hasCameraPermission ? (
        <View style={styles.cameraPreview}>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
          />
        </View>
      ) : (
        <View style={styles.cameraPreviewOff}>
          <Text style={{ color: "#aaa" }}>Video off</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050A0E",
    paddingHorizontal: 42,
  },
  callBox: {
    backgroundColor: "#1A1C22",
    padding: 40,
    marginTop: 60,
    justifyContent: "center",
    borderRadius: 14,
  },
  label: {
    fontSize: 18,
    color: "#D0D4DD",
  },
  callBtn: {
    height: 50,
    backgroundColor: "#1E88E5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginTop: 16,
  },
  callBtnText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  cameraPreview: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#1E88E5",
    backgroundColor: "#000",
  },
  cameraPreviewOff: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    backgroundColor: "#1A1C22",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#333",
  },
});
