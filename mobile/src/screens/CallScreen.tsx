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
import { FontAwesome, SimpleLineIcons } from "@expo/vector-icons";
import { useWebRTC } from "../context/WebRTCContext";

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
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const localMediaStream = useRef<MediaStream | null>(null);
  const remoteMediaStream = useRef<MediaStream | null>(null);
  const remoteCandidates = useRef<RTCIceCandidate[]>([]);
  const {
    peerConnection,
    localStream,
    setLocalStream,
    remoteStream,
    setRemoteStream,
  } = useWebRTC();
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
    if (localMediaStream.current) return;

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

    localMediaStream.current?.getTracks().forEach((track) => track.stop());
    localMediaStream.current = null;
    setLocalStream(null);

    // remoteMediaStream.current = null;
    // setRemoteStream(null);

    peerConnection.current?.close();
    peerConnection.current = null;

    navigation.navigate("MakeCall");
  }

  const toggleAudio = () => {
    if (localMediaStream.current) {
      const audioTracks = localMediaStream.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const audioTrack = audioTracks[0];
        const isEnabled = audioTrack.enabled;
        audioTrack.enabled = !isEnabled;
        setIsAudioEnabled(!isEnabled);

        if (peerConnection.current) {
          peerConnection.current.getSenders().forEach((sender) => {
            if (sender.track?.kind === "audio") {
              sender.track.enabled = !isEnabled;
            }
          });
        }
      }
    }
  };

  const toggleVideo = () => {
    if (localMediaStream.current) {
      localMediaStream.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled((prev) => !prev);
    }
  };

  const handleOffer = async (incoming: any) => {
    try {
      if (incoming.offer === null) return;

      const rtcOffer = new RTCSessionDescription(incoming.offer);

      if (
        peerConnection.current?.signalingState !== "stable" &&
        peerConnection.current?.signalingState !== "have-remote-offer"
      ) {
        console.warn(
          "Skipping offer: not in stable state",
          peerConnection.current?.signalingState
        );
        return;
      }

      await peerConnection.current?.setRemoteDescription(rtcOffer);

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
      if (!peerConnection.current) return;

      const signalingState = peerConnection.current.signalingState;
      console.log("Signaling state before setting answer:", signalingState);

      if (signalingState !== "have-local-offer") {
        console.warn(
          "Skipping setRemoteDescription(answer): not in 'have-local-offer'"
        );
        return;
      }

      if (peerConnection.current.remoteDescription) {
        console.warn("Remote description already set. Skipping.");
        return;
      }

      const remoteDesc = new RTCSessionDescription(answer);
      await peerConnection.current.setRemoteDescription(remoteDesc);

      // Now add any stored ICE candidates
      remoteCandidates.current.forEach((candidate) => {
        peerConnection.current?.addIceCandidate(candidate);
      });
      remoteCandidates.current = [];
    } catch (err) {
      console.error("Error setting remote answer:", err);
    }
  };

  console.log("calls");
  const handleCandidate = (candidate: any) => {
    handleRemoteCandidate(candidate.candidate);
    // processCandidates();
  };

  console.log("calls");

  useEffect(() => {
    if (peerConnection.current) return;

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

    const onAnswer = (data: any) => handleAnswer(data);
    const onOffer = (data: any) => handleOffer(data);
    const onCandidate = (data: any) => handleCandidate(data);

    if (isInitiator) {
      socket.on("answer", onAnswer);
    } else {
      socket.on("offer", onOffer);
    }
    socket.on("ice-candidate", onCandidate);

    return () => {
      socket.off("offer", onOffer);
      socket.off("answer", onAnswer);
      socket.off("ice-candidate", onCandidate);
    };
  }, []);

  useEffect(() => {
    if (callState.state === null) {
      localMediaStream.current?.getTracks().forEach((track) => track.stop());
      localMediaStream.current = null;
      setLocalStream(null);

      remoteMediaStream.current = null;
      // setRemoteStream(null);

      peerConnection.current?.close();
      peerConnection.current = null;
      navigation.navigate("MakeCall");
    }
  }, [callState]);

  return (
    <View style={styles.container}>
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
        />
      )}

      {isVideoEnabled && localStream && remoteMediaStream ? (
        <View style={styles.localPreviewWrapper}>
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
            mirror={true}
          />
        </View>
      ) : (
        <View style={styles.localPreviewWrapper}>
          <View style={[styles.localVideo, styles.videoOffPlaceholder]}>
            <Text style={styles.videoOffText}>Video Off</Text>
          </View>
        </View>
      )}

      <View
        style={{
          justifyContent: "space-around",
          alignItems: "center",
          position: "absolute",
          bottom: 20,
          alignSelf: "center",
          flexDirection: "row",
          width: "100%",
        }}
      >
        <TouchableOpacity
          onPress={toggleAudio}
          style={{
            backgroundColor: isAudioEnabled ? "#4CAF50" : "#A9A9A9",
            borderRadius: 30,
            height: 60,
            width: 60,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FontAwesome
            name={isAudioEnabled ? "microphone" : "microphone-slash"}
            size={28}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleVideo}
          style={{
            backgroundColor: isVideoEnabled ? "#4CAF50" : "#A9A9A9",
            borderRadius: 30,
            height: 60,
            width: 60,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SimpleLineIcons
            name={isVideoEnabled ? "camrecorder" : "camrecorder"}
            size={28}
            color="white"
          />
        </TouchableOpacity>
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
  videoOffPlaceholder: {
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  videoOffText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  localPreviewWrapper: {
    position: "absolute",
    bottom: 100,
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
