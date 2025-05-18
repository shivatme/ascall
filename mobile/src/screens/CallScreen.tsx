import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
} from "react-native-webrtc";
import { useSocket } from "../context/SocketContext";
import { SimpleLineIcons } from "@expo/vector-icons";

interface CallScreenProps {
  route: any;
  navigation: any;
}

let mediaConstraints = {
  audio: true,
  video: {
    frameRate: 30,
    facingMode: "user",
  },
};

let isVoiceOnly = false;

function CallScreen({ route, navigation }: CallScreenProps): JSX.Element {
  const { roomId, isInitiator } = route.params;

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localMediaStream = useRef<MediaStream | null>(null);
  const remoteMediaStream = useRef<MediaStream | null>(null);

  const {
    socket,
    sendOffer,
    sendAnswer,
    sendCandidate,
    endCallByRoomId,
    callState,
  } = useSocket();

  async function makeCall() {
    if (!socket) return;

    try {
      const mediaStream = await mediaDevices.getUserMedia(mediaConstraints);
      console.log(mediaStream);
      if (isVoiceOnly) {
        let videoTrack = mediaStream.getVideoTracks()[0];
        videoTrack.enabled = false;
      }

      setLocalStream(mediaStream);
      localMediaStream.current = mediaStream;
    } catch (err) {
      console.log(err);
      // Handle Error
    }

    peerConnection.current?.addEventListener("connectionstatechange", () => {
      switch (peerConnection.current?.connectionState) {
        case "closed":
          console.log("Connection closed.");
          break;
      }
    });

    peerConnection.current?.addEventListener("iceconnectionstatechange", () => {
      switch (peerConnection.current?.iceConnectionState) {
        case "connected":
        case "completed":
          // You can handle the call being connected here.
          // Like setting the video streams to visible.
          break;
      }
    });
    peerConnection.current?.addEventListener("negotiationneeded", async () => {
      try {
        socket.emit("offer", {
          offer: peerConnection.current?.localDescription,
          roomId,
        });
      } catch (err) {
        console.error("Negotiation er:", err);
      }
    });
    peerConnection.current?.addEventListener("track", (event) => {
      // Grab the remote track from the connected participant.
      remoteMediaStream.current =
        remoteMediaStream.current || new MediaStream();
      if (event.track) {
        remoteMediaStream.current?.addTrack(event.track);
        setRemoteStream(remoteMediaStream.current);
      }
    });

    // Add our stream to the peer connection.
    if (localMediaStream.current) {
      let ml = localMediaStream.current;
      localMediaStream.current
        ?.getTracks()
        .forEach((track) => peerConnection.current?.addTrack(track, ml));
    }

    let sessionConstraints = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true,
        VoiceActivityDetection: true,
      },
    };

    try {
      const offerDescription = await peerConnection.current?.createOffer(
        sessionConstraints
      );
      await peerConnection.current?.setLocalDescription(offerDescription);
      sendOffer(offerDescription, roomId);
      // socket.emit("offer", offerDescription, roomId);
    } catch (err) {
      // Handle Errors
    }

    peerConnection.current?.addEventListener("icecandidate", (event) => {
      if (!event.candidate) {
        return;
      }
      sendCandidate(event.candidate, roomId);
      // socket.emit("ice-candidate", event.candidate, roomId);
    });
  }
  async function setupLocalStreamOnly() {
    const mediaStream = await mediaDevices.getUserMedia(mediaConstraints);
    if (isVoiceOnly) {
      let videoTrack = mediaStream.getVideoTracks()[0];
      videoTrack.enabled = false;
    }
    setLocalStream(mediaStream);
    localMediaStream.current = mediaStream;

    localMediaStream.current
      ?.getTracks()
      .forEach((track) => peerConnection.current?.addTrack(track, mediaStream));

    peerConnection.current?.addEventListener("icecandidate", (event) => {
      if (!event.candidate) {
        return;
      }
      sendCandidate(event.candidate, roomId);
      // socket.emit("ice-candidate", event.candidate, roomId);
    });

    peerConnection.current?.addEventListener("track", (event) => {
      // Grab the remote track from the connected participant.
      remoteMediaStream.current =
        remoteMediaStream.current || new MediaStream();
      if (event.track) {
        remoteMediaStream.current?.addTrack(event.track);
        setRemoteStream(remoteMediaStream.current);
      }
    });
  }

  useEffect(() => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    });
    if (isInitiator) {
      makeCall();
    } else {
      // Just prepare media, but don't create an offer
      setupLocalStreamOnly();
    }
    return () => {
      // Optional cleanup
      peerConnection.current?.close();
      peerConnection.current = null;
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleOffer = async (incoming: any) => {
      try {
        if (incoming.offer === null) return;
        const rtcOffer = new RTCSessionDescription(incoming.offer);
        await peerConnection.current?.setRemoteDescription(rtcOffer);
        remoteCandidates.current.forEach((candidate) => {
          peerConnection.current?.addIceCandidate(candidate);
        });
        remoteCandidates.current = [];

        const answer = await peerConnection.current?.createAnswer();
        await peerConnection.current?.setLocalDescription(answer);
        sendAnswer(answer, roomId);
      } catch (err) {
        console.log("Error handling offer:", err);
      }
    };

    const handleAnswer = async (answerDescription: any) => {
      const answer = answerDescription.answer;
      try {
        const answerDescription1 = new RTCSessionDescription(answer);
        await peerConnection.current?.setRemoteDescription(answerDescription1);
        remoteCandidates.current.forEach((candidate) => {
          peerConnection.current?.addIceCandidate(candidate);
        });
        remoteCandidates.current = [];
      } catch (err) {
        console.error("Error setting remote answer:", err);
      }
    };
    const handleCandidate = (candidate: any) => {
      handleRemoteCandidate(candidate.candidate);
      // processCandidates();
    };
    if (isInitiator) {
      socket.on("answer", (data) => {
        handleAnswer(data);
      });
    } else socket.on("offer", handleOffer);
    socket.on("ice-candidate", handleCandidate);
  }, []);

  useEffect(() => {
    if (callState.incomingCall === null) {
      peerConnection.current?.close();
      navigation.navigate("MakeCall");
    }
  }, [callState]);

  const remoteCandidates = useRef<RTCIceCandidate[]>([]);

  function handleRemoteCandidate(iceCandidate: RTCIceCandidate) {
    try {
      iceCandidate = new RTCIceCandidate(iceCandidate);
      if (peerConnection.current?.remoteDescription == null) {
        return remoteCandidates.current?.push(iceCandidate);
      }

      return peerConnection.current?.addIceCandidate(iceCandidate);
    } catch (error) {
      console.log(error, "icers");
    }
  }

  function endCallNow() {
    endCallByRoomId(roomId);
    peerConnection.current?.close();
    navigation.navigate("MakeCall");
  }

  return (
    <View style={styles.container}>
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
        />
      )}

      {localStream && remoteStream && (
        <View style={styles.localPreviewWrapper}>
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
            mirror={true}
          />
        </View>
      )}
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          bottom: 20,
          alignSelf: "center",
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
  container: {
    flex: 1,
    backgroundColor: "black",
    position: "relative",
  },
  remoteVideo: {
    width: "100%",
    height: "100%",
  },
  localPreviewWrapper: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 12,
    overflow: "hidden", // This clips RTCView inside
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#fff",
    elevation: 10,
  },
  localVideo: {
    flex: 1,
    backgroundColor: "black",
  },
});

export default CallScreen;
