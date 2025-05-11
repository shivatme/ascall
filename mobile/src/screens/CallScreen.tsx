import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
} from "react-native-webrtc";
import { useSocket } from "../context/SocketContext";

interface CallScreenProps {
  route: any;
}

let mediaConstraints = {
  audio: true,
  video: {
    frameRate: 30,
    facingMode: "user",
  },
};

let isVoiceOnly = false;

function CallScreen({ route }: CallScreenProps): JSX.Element {
  const { roomId, isInitiator } = route.params;

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localMediaStream = useRef<MediaStream | null>(null);
  const remoteMediaStream = useRef<MediaStream | null>(null);

  const { socket, sendOffer, sendAnswer, sendCandidate } = useSocket();

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
          console.log("connected");
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
      console.log("remoteMediaStream");
      if (event.track) {
        console.log(event.track);
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
        console.log("Remote description set");

        // processCandidates();
      } catch (err) {
        console.error("Error setting remote answer:", err);
      }
    };
    const handleCandidate = (candidate: any) => {
      console.log(isInitiator);
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

  const remoteCandidates = useRef<RTCIceCandidate[]>([]);

  function handleRemoteCandidate(iceCandidate: RTCIceCandidate) {
    // console.log("Remote candidate received");
    try {
      iceCandidate = new RTCIceCandidate(iceCandidate);
      console.log(iceCandidate, "ice");
      if (peerConnection.current?.remoteDescription == null) {
        console.log("Queuing ICE candidate");
        return remoteCandidates.current?.push(iceCandidate);
      }

      return peerConnection.current?.addIceCandidate(iceCandidate);
    } catch (error) {
      console.log(error, "icers");
    }

    // console.log("Adding ICE candidate immediately");
  }

  function processCandidates() {
    console.log(
      "Processing queued ICE candidates:",
      remoteCandidates.current.length
    );
    remoteCandidates.current.forEach((candidate) => {
      peerConnection.current?.addIceCandidate(candidate);
    });
    remoteCandidates.current = [];
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

// let localMediaStream1: MediaStream | null = null;
//   let remoteMediaStream1: MediaStream | null = null;
//   const peerConnection1 = new RTCPeerConnection({
//     iceServers: [
//       {
//         urls: "stun:stun.l.google.com:19302",
//       },
//       {
//         urls: "stun:stun1.l.google.com:19302",
//       },
//       {
//         urls: "stun:stun2.l.google.com:19302",
//       },
//     ],
//   });
//   async function makeCall2() {
//     if (!socket) return;
//     try {
//       const mediaStream = await mediaDevices.getUserMedia(mediaConstraints);

//       if (isVoiceOnly) {
//         let videoTrack = mediaStream.getVideoTracks()[0];
//         videoTrack.enabled = false;
//       }

//       setLocalStream(mediaStream);
//       localMediaStream1 = mediaStream;
//     } catch (err) {
//       console.log(err);
//       // Handle Error
//     }

//     peerConnection1.addEventListener("negotiationneeded", (event) => {
//       // You can start the offer stages here.
//       // Be careful as this event can be called multiple times.
//       socket.emit("offer", { offer: peerConnection1.localDescription, roomId });
//     });
//     peerConnection1.addEventListener("track", (event) => {
//       // Grab the remote track from the connected participant.
//       remoteMediaStream1 = remoteMediaStream1 || new MediaStream();
//       if (event.track) {
//         remoteMediaStream1.addTrack(event.track);
//         setRemoteStream(remoteMediaStream1);
//       }
//     });
//     if (localMediaStream1) {
//       let ml = localMediaStream1;
//       localMediaStream1
//         .getTracks()
//         .forEach((track) => peerConnection1.addTrack(track, ml));
//     }

//     let sessionConstraints = {
//       mandatory: {
//         OfferToReceiveAudio: true,
//         OfferToReceiveVideo: true,
//         VoiceActivityDetection: true,
//       },
//     };
//     try {
//       const offerDescription = await peerConnection1.createOffer(
//         sessionConstraints
//       );
//       await peerConnection1.setLocalDescription(offerDescription);

//       socket.emit("offer", { offer: offerDescription, roomId });
//     } catch (err) {
//       // Handle Errors
//     }
//     try {
//       // Use the received offerDescription
//       //@ts-ignore
//       socket.on("offer", async (offerDescription) => {
//         const offerDescription1 = new RTCSessionDescription(
//           offerDescription.offer
//         );
//         await peerConnection1.setRemoteDescription(offerDescription1);
//         const answerDescription = await peerConnection1.createAnswer();
//         socket.emit("answer", { answer: answerDescription, roomId });

//         await peerConnection1.setLocalDescription(answerDescription);
//       });

//       // Here is a good place to process candidates.
//       processCandidates1();
//       // Send the answerDsoescription back as a response to the offerDescription.
//     } catch (err) {
//       // Handle Errors
//     }
//     try {
//       // Use the received answerDescription
//       //@ts-ignore
//       socket.on("answer", async (answerDescription) => {
//         const answerDescription1 = new RTCSessionDescription(
//           answerDescription.answer
//         );

//         await peerConnection1.setRemoteDescription(answerDescription1);
//       });
//     } catch (err) {
//       // Handle Error
//     }
//     peerConnection1.addEventListener("icecandidate", (event) => {
//       if (!event.candidate) {
//         return;
//       }
//       socket.emit("ice-candidate", { candidate: event.candidate, roomId });
//     });

//     socket.on("ice-candidate", (candidate) => {
//       handleRemoteCandidate1(candidate.candidate);
//     });
//   }

//   useEffect(() => {
//     // makeCall2();
//   }, []);
//   let remoteCandidates1: RTCIceCandidate[] = [];

//   function handleRemoteCandidate1(iceCandidate: RTCIceCandidate) {
//     iceCandidate = new RTCIceCandidate(iceCandidate);

//     if (peerConnection1.remoteDescription == null) {
//       return remoteCandidates1.push(iceCandidate);
//     }

//     return peerConnection1.addIceCandidate(iceCandidate);
//   }

//   function processCandidates1() {
//     if (remoteCandidates1.length < 1) {
//       return;
//     }

//     remoteCandidates1.map((candidate) =>
//       peerConnection1.addIceCandidate(candidate)
//     );
//     remoteCandidates1 = [];
//   }
