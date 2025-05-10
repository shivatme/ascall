import { RTCPeerConnection, RTCView, mediaDevices } from "react-native-webrtc";

const pc = new RTCPeerConnection({
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
});

export default pc;
