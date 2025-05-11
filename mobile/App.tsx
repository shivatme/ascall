import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, View, StyleSheet, Text } from "react-native";
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
import { NavigationContainer } from "@react-navigation/native";

const socket = io("http://192.168.29.162:3000", {
  transports: ["websocket"],
});
let peerConstraints = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};
const room = "my-room";
const App = (): JSX.Element => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pc = new RTCPeerConnection(peerConstraints);
  const peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
      {
        urls: "stun:stun1.l.google.com:19302",
      },
      {
        urls: "stun:stun2.l.google.com:19302",
      },
    ],
  });

  let mediaConstraints = {
    audio: true,
    video: {
      frameRate: 30,
      facingMode: "user",
    },
  };

  let localMediaStream: MediaStream | null = null;
  let remoteMediaStream: MediaStream | null = null;
  let isVoiceOnly = false;

  async function makeCall() {
    socket.on("connect", () => {
      socket.emit("join", room);
    });

    try {
      const mediaStream = await mediaDevices.getUserMedia(mediaConstraints);

      if (isVoiceOnly) {
        let videoTrack = mediaStream.getVideoTracks()[0];
        videoTrack.enabled = false;
      }

      setLocalStream(mediaStream);
      localMediaStream = mediaStream;
    } catch (err) {
      console.log(err);
      // Handle Error
    }

    peerConnection.addEventListener("connectionstatechange", (event) => {
      switch (peerConnection.connectionState) {
        case "closed":
          console.log("Connection closed.");
          break;
      }
    });

    peerConnection.addEventListener("iceconnectionstatechange", (event) => {
      switch (peerConnection.iceConnectionState) {
        case "connected":
        case "completed":
          // You can handle the call being connected here.
          // Like setting the video streams to visible.
          console.log("connected");
          break;
      }
      peerConnection.addEventListener("negotiationneeded", (event) => {
        // You can start the offer stages here.
        // Be careful as this event can be called multiple times.
        socket.emit("offer", peerConnection.localDescription, room);
      });
    });
    peerConnection.addEventListener("track", (event) => {
      // Grab the remote track from the connected participant.
      remoteMediaStream = remoteMediaStream || new MediaStream();
      if (event.track) {
        remoteMediaStream.addTrack(event.track);
        setRemoteStream(remoteMediaStream);
      }
    });

    // Add our stream to the peer connection.
    if (localMediaStream) {
      let ml = localMediaStream;
      localMediaStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, ml));
    }

    let sessionConstraints = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true,
        VoiceActivityDetection: true,
      },
    };

    try {
      const offerDescription = await peerConnection.createOffer(
        sessionConstraints
      );
      await peerConnection.setLocalDescription(offerDescription);

      socket.emit("offer", offerDescription, room);
    } catch (err) {
      // Handle Errors
    }

    try {
      // Use the received offerDescription
      //@ts-ignore
      socket.on("offer", async (offerDescription) => {
        const offerDescription1 = new RTCSessionDescription(offerDescription);
        await peerConnection.setRemoteDescription(offerDescription1);
        const answerDescription = await peerConnection.createAnswer();
        socket.emit("answer", answerDescription, room);
        console.log(
          "peerConnection.remoteDescriptioncz, czmxnczxm.cm.xz,mc.,xzm,.cmzx.,mc,.zxmc,.zm.cm.z,m"
        );
        await peerConnection.setLocalDescription(answerDescription);
      });

      // Here is a good place to process candidates.
      processCandidates();
      // Send the answerDsoescription back as a response to the offerDescription.
    } catch (err) {
      // Handle Errors
    }

    try {
      // Use the received answerDescription
      //@ts-ignore
      socket.on("answer", async (answerDescription) => {
        const answerDescription1 = new RTCSessionDescription(answerDescription);

        await peerConnection.setRemoteDescription(answerDescription1);
      });
    } catch (err) {
      // Handle Error
    }

    peerConnection.addEventListener("icecandidate", (event) => {
      if (!event.candidate) {
        return;
      }
      socket.emit("ice-candidate", event.candidate, room);
    });

    socket.on("ice-candidate", (candidate) => {
      handleRemoteCandidate(candidate);
    });
  }
  useEffect(() => {
    makeCall();
  }, []);

  let remoteCandidates: RTCIceCandidate[] = [];

  function handleRemoteCandidate(iceCandidate: RTCIceCandidate) {
    iceCandidate = new RTCIceCandidate(iceCandidate);

    if (peerConnection.remoteDescription == null) {
      return remoteCandidates.push(iceCandidate);
    }

    return peerConnection.addIceCandidate(iceCandidate);
  }

  function processCandidates() {
    if (remoteCandidates.length < 1) {
      return;
    }

    remoteCandidates.map((candidate) =>
      peerConnection.addIceCandidate(candidate)
    );
    remoteCandidates = [];
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#000" />
        {localStream && (
          <RTCView streamURL={localStream.toURL()} style={styles.video} />
        )}
        {remoteStream && (
          <RTCView streamURL={remoteStream.toURL()} style={styles.video} />
        )}
        <Text>APP</Text>
      </SafeAreaView>
    </NavigationContainer>
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
