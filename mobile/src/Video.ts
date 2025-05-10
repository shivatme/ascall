import React, { useEffect, useRef, useState } from "react";
import {
  mediaDevices,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
} from "react-native-webrtc";
import socket from "./socket";

const config: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const roomId = "my-room";

const VideoCall: React.FC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pc = useRef<RTCPeerConnection>(new RTCPeerConnection(config));
  const isOfferer = useRef<boolean>(false);

  useEffect(() => {
    // Join signaling room
    socket.emit("join", roomId);

    // Get user media
    mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream: MediaStream) => {
        setLocalStream(stream);
        stream
          .getTracks()
          .forEach((track) => pc.current.addTrack(track, stream));
      });

    // Handle ICE candidates
    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", event.candidate, roomId);
      }
    };

    // Handle remote stream
    pc.current.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // Remote user joined
    socket.on("user-joined", async () => {
      isOfferer.current = true;
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      socket.emit("offer", offer, roomId);
    });

    // Handle offer
    socket.on("offer", async (offer: RTCSessionDescriptionInit) => {
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit("answer", answer, roomId);
    });

    // Handle answer
    socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
      await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // Handle ICE candidate
    socket.on("ice-candidate", async (candidate: RTCIceCandidateInit) => {
      try {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Failed to add ICE candidate:", error);
      }
    });

    return () => {
      socket.disconnect();
      pc.current.close();
    };
  }, []);

  return (
    <>
      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={{ width: "100%", height: 200 }}
        />
      )}
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={{ width: "100%", height: 200 }}
        />
      )}
    </>
  );
};

export default VideoCall;
