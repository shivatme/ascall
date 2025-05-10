import React from "react";
import { View, StyleSheet, Button } from "react-native";
import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  MediaStream,
  MediaStreamTrack,
  RTCIceCandidate,
  RTCSessionDescription,
} from "react-native-webrtc";

interface VideoProps {
  hangup: any;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

function Video(props: VideoProps): JSX.Element {
  if (props.localStream && !props.remoteStream) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <RTCView
          streamURL={props.localStream.toURL()}
          style={styles.video}
          objectFit="cover"
        />
        <Button title="Hang Up" onPress={props.hangup} />
      </View>
    );
  }
  return <View style={styles.container}></View>;
}

const styles = StyleSheet.create({
  container: {},
  video: {
    width: 150,
    height: 250,
    backgroundColor: "black",
  },
});

export default Video;
