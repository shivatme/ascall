// ==========================
// Frontend: React Native App (TypeScript)
// ==========================

// File: App.tsx
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  MediaStream,
  MediaStreamTrack,
  RTCIceCandidate,
  RTCSessionDescription,
} from "react-native-webrtc";
import io from "socket.io-client";

const socket = io("http://192.168.29.162:3000");
let peerConstraints = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};
const App = (): JSX.Element => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pc = new RTCPeerConnection(peerConstraints);

  let mediaConstraints = {
    audio: true,
    video: {
      frameRate: 30,
      facingMode: "user",
    },
  };

  let localMediaStream;
  let remoteMediaStream;
  let isVoiceOnly = false;

  async function getMediaStream() {
    try {
      const mediaStream = await mediaDevices.getUserMedia(mediaConstraints);

      localMediaStream = mediaStream;
    } catch (err) {
      console.log(err);
    }
  }

  function test(){
    socket.emit("join", "my-room");
    let peerConstraints = {
	iceServers: [
		{
			urls: 'stun:stun.l.google.com:19302'
		}
	]
};

let peerConnection = new RTCPeerConnection( peerConstraints );
peerConnection.addEventListener( 'icecandidate', event => {
	// When you find a null candidate then there are no more candidates.
	// Gathering of candidates has finished.
	if ( !event.candidate ) { return; };
socket.emit( 'ice-candidate', { room: 'my-room', candidate: event.candidate } );
	// Send the event.candidate onto the person you're calling.
	// Keeping to Trickle ICE Standards, you should send the candidates immediately.
} );

peerConnection.addEventListener( 'negotiationneeded', event => {

  peerConnection.createOffer(peerConstraints).then( offer => {
    peerConnection.setLocalDescription( offer );
    console.log('Offer created');
    socket.emit( 'offer', offer, 'my-room' );
  } );
  socket.emit('ice-candidate', { room: 'my-room', candidate: event. } );
} );
  }
  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000" />
      {localStream && (
        <RTCView streamURL={localStream.toURL()} style={styles.video} />
      )}
      {remoteStream && (
        <RTCView streamURL={remoteStream.toURL()} style={styles.video} />
      )}s
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  video: { width: 150, height: 250, backgroundColor: "black" },
});

export default App;
