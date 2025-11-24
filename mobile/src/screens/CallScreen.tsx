import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native";
import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
} from "react-native-webrtc";
import { useSocket } from "../context/SocketContext";
import { FontAwesome, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { useWebRTC } from "../context/WebRTCContext";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { useCallback } from "react";

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
  const {
    roomId,
    isInitiator,
    calleeId,
    videoEnabled = true,
    micEnabled = true,
  } = route.params;
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(micEnabled);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(videoEnabled);
  const [isRemoteVideoEnabled, setRemoteVideoEnabled] = useState<boolean>(true);
  const [isRemoteAudioEnabled, setRemoteAudioEnabled] = useState<boolean>(true);
  const [showBottomButtons, setShowBottomButtons] = useState<boolean>(false);

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
          endCallNow();
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

    remoteMediaStream.current = null;
    setRemoteStream(null);

    peerConnection.current?.close();
    peerConnection.current = null;
    if (isInitiator === true)
      navigation.navigate("MakeCallScreen", {
        calleeId,
        roomId,
      });
    else {
      navigation.navigate("HomeScreen");
    }
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
    if (isVideoEnabled) {
      setFullScreenSelf(false);
    }
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

  const handleCandidate = (candidate: any) => {
    handleRemoteCandidate(candidate.candidate);
    // processCandidates();
  };
  // remoteMediaStream.current?.getTracks().forEach((track) => {
  //   track.addEventListener("mute", () => {
  //     if (track.kind === "audio") {
  //       setRemoteAudioEnabled(false);
  //     } else if (track.kind === "video") {
  //       setRemoteVideoEnabled(false);
  //     }
  //   });
  //   track.addEventListener("unmute", () => {
  //     if (track.kind === "audio") {
  //       setRemoteAudioEnabled(true);
  //     } else if (track.kind === "video") {
  //       setRemoteVideoEnabled(true);
  //     }
  //   });
  // });

  useEffect(() => {
    if (peerConnection.current) return;

    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },

        //Temp Credentials
        {
          urls: "turn:turn.shivat.me:3478",
          username: "shivam",
          credential: "mystrongpassword123",
        },
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
      if (isInitiator === true)
        navigation.navigate("MakeCallScreen", {
          calleeId,
          roomId,
        });
      else {
        navigation.navigate("HomeScreen");
      }
    }
  }, [callState]);

  async function switchCamera() {
    try {
      const devices =
        (await mediaDevices.enumerateDevices()) as MediaDeviceInfo[];

      // Count video input devices (cameras)
      const videoInputDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (videoInputDevices.length < 2) {
        console.log("Only one camera available, can't switch");
        return;
      }

      // Toggle camera facing mode
      const newFacingMode = isFrontCamera ? "environment" : "user";

      // Get new stream with switched camera
      const newStream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          frameRate: 30,
          facingMode: newFacingMode,
        },
      });

      // Replace the video track in local stream and peer connection
      const newVideoTrack = newStream.getVideoTracks()[0];
      const oldVideoTrack = localMediaStream.current?.getVideoTracks()[0];

      if (oldVideoTrack && peerConnection.current) {
        // Replace track in peer connection sender
        const sender = peerConnection.current
          .getSenders()
          .find((s) => s.track?.kind === "video");

        sender?.replaceTrack(newVideoTrack);
      }

      // Stop old video track
      oldVideoTrack?.stop();

      // Update local stream with new video track
      if (localMediaStream.current && oldVideoTrack) {
        localMediaStream.current.removeTrack(oldVideoTrack);
        localMediaStream.current.addTrack(newVideoTrack);
        setLocalStream(localMediaStream.current);
      } else {
        setLocalStream(newStream);
        localMediaStream.current = newStream;
      }

      setIsFrontCamera(!isFrontCamera);
    } catch (err) {
      console.error("Error switching camera:", err);
    }
  }

  const [fullScreenSelf, setFullScreenSelf] = useState(false);
  const { width, height } = Dimensions.get("window");
  const smallVideoHeight = 150;
  const smallVideoWidth = 100;
  const padding = 40;
  const corners = [
    { x: padding, y: padding * 2 }, // top-left
    { x: width - smallVideoWidth - padding, y: padding * 2 }, // top-right
    { x: padding, y: height - smallVideoHeight - padding }, // bottom-left
    {
      x: width - smallVideoWidth - padding,
      y: height - smallVideoHeight - padding,
    }, // bottom-leftright
  ];

  const getClosestCorner = (point: { x: number; y: number }) => {
    "worklet";

    let minDist = Infinity;
    let closest = corners[0];

    for (const corner of corners) {
      const dist = (corner.x - point.x) ** 2 + (corner.y - point.y) ** 2;
      if (dist < minDist) {
        minDist = dist;
        closest = corner;
      }
    }

    return closest;
  };

  const isPressed = useSharedValue(false);
  const offset = useSharedValue({
    x: width - smallVideoWidth - padding,
    y: height - smallVideoHeight - padding,
  });
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
        { scale: withSpring(isPressed.value ? 1.05 : 1) },
      ],
    };
  });
  const start = useSharedValue({
    x: width - smallVideoWidth - padding,
    y: height - smallVideoHeight - padding,
  });

  const gesture = Gesture.Pan()
    .onBegin(() => {
      isPressed.value = true;
    })
    .onUpdate((e) => {
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    })
    .onEnd(() => {
      const current = {
        x: offset.value.x,
        y: offset.value.y,
      };
      const nearestCorner = getClosestCorner(current);

      // Animate to nearest corner
      offset.value = {
        x: withTiming(nearestCorner.x),
        y: withTiming(nearestCorner.y),
      };

      // Save new start value for next drag
      start.value = nearestCorner;
    })
    .onFinalize(() => {
      isPressed.value = false;
    });

  function toggleBottomMenu() {
    setShowBottomButtons((prev) => {
      // if (prev === true && offset.value.y > height / 2) {
      //   offset.value = {
      //     x: offset.value.x,
      //     y: withTiming(offset.value.y - 100),
      //   };
      // }
      return !prev;
    });
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
    navigation.setOptions({
      gestureEnabled: false,
      headerBackVisible: false,
    });
  }, []);
  return (
    <Pressable onPress={toggleBottomMenu} style={styles.container}>
      {remoteStream && localStream ? (
        <View>
          <RTCView
            streamURL={
              fullScreenSelf ? localStream.toURL() : remoteStream.toURL()
            }
            style={styles.remoteVideo}
            objectFit="cover"
            zOrder={0}
          />
        </View>
      ) : (
        <View>
          <View style={[styles.localVideo, styles.videoOffPlaceholder]}>
            <Text style={styles.videoOffText}>Video Off</Text>
          </View>
        </View>
      )}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.localPreviewWrapper2, animatedStyles]}>
          {localStream && remoteStream && isVideoEnabled ? (
            <Pressable
              onPress={() => {
                setFullScreenSelf(!fullScreenSelf);
              }}
              style={styles.localPreviewWrapper}
              key={isFrontCamera.toString()}
            >
              <RTCView
                streamURL={
                  fullScreenSelf ? remoteStream.toURL() : localStream.toURL()
                }
                style={styles.localVideo}
                objectFit="cover"
                mirror={true}
                zOrder={8}
              />
            </Pressable>
          ) : (
            <View style={styles.localPreviewWrapper}>
              <View style={[styles.localVideo, styles.videoOffPlaceholder]}>
                <Text style={styles.videoOffText}>Video Off</Text>
              </View>
            </View>
          )}
        </Animated.View>
      </GestureDetector>

      {showBottomButtons && (
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
            onPress={switchCamera}
            style={{
              backgroundColor: "#414141",
              borderRadius: 30,
              height: 60,
              width: 60,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name={"camera-reverse-sharp"} size={28} color="white" />
          </TouchableOpacity>
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
      )}
    </Pressable>
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
    zIndex: 0,
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
  localPreviewWrapper2: {
    position: "absolute",
    // bottom: 100,
    // right: 20,
  },
  localPreviewWrapper: {
    width: 100,
    height: 150,
    elevation: 10,
    zIndex: 10,
  },
  localVideo: {
    flex: 1,
    backgroundColor: "black",
  },
});

export default CallScreen;
