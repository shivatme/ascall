const socket = io();
const room = "my-room"; // for now, a hardcoded room

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

let localStream;
let peerConnection;

const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    localVideo.srcObject = stream;
    localStream = stream;
    socket.emit("join", room);
  })
  .catch((err) => console.error("Error accessing media devices.", err));

socket.on("user-joined", () => {
  createPeerConnection();
  localStream
    .getTracks()
    .forEach((track) => peerConnection.addTrack(track, localStream));

  peerConnection.createOffer().then((offer) => {
    peerConnection.setLocalDescription(offer);
    socket.emit("offer", offer, room);
  });
});

socket.on("offer", (offer) => {
  createPeerConnection();
  peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  localStream
    .getTracks()
    .forEach((track) => peerConnection.addTrack(track, localStream));

  peerConnection.createAnswer().then((answer) => {
    peerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, room);
  });
});

socket.on("answer", (answer) => {
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on("ice-candidate", (candidate) => {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

function createPeerConnection() {
  if (peerConnection) return;

  peerConnection = new RTCPeerConnection(config);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate, room);
    }
  };

  peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };
}
