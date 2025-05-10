import { io, Socket } from "socket.io-client";

const socket: Socket = io("https://192.168.1.77:3010", {
  transports: ["websocket"],
});

export default socket;
