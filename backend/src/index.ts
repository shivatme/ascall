import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 3010;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow mobile app to connect
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("offer", (data) => {
    socket.to(data.to).emit("offer", {
      from: socket.id,
      sdp: data.sdp,
    });
  });

  socket.on("answer", (data) => {
    socket.to(data.to).emit("answer", {
      from: socket.id,
      sdp: data.sdp,
    });
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.to).emit("ice-candidate", {
      from: socket.id,
      candidate: data.candidate,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
