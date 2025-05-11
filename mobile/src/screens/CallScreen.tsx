import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { MediaStream, RTCView } from "react-native-webrtc";

interface CallScreenProps {}

function CallScreen(props: CallScreenProps): JSX.Element {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  return (
    <View style={styles.container}>
      {localStream && (
        <RTCView streamURL={localStream.toURL()} style={styles.video} />
      )}
      {remoteStream && (
        <RTCView streamURL={remoteStream.toURL()} style={styles.video} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  video: { width: 150, height: 250, backgroundColor: "black" },
});

export default CallScreen;
