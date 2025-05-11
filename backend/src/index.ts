import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
let userSockets: { [userId: string]: string } = {};

const app = express();
const server = http.createServer(
  // {
  //   key: fs.readFileSync("./cert/key.pem"),
  //   cert: fs.readFileSync("./cert/cert.pem"),
  // },
  app
);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow cross-origin requests
    methods: ["GET", "POST"],
  },
});

// Serve static HTML files from 'public' folder
app.use(express.static(path.join(__dirname, "../public")));

io.on("connection", (socket) => {
  console.log(`✅ Connected: ${socket.id}`);

  // === Call lifecycle events ===
  // Assuming users have a userId they send upon connecting:
  socket.on("register-user", (userId) => {
    console.log(`User ${userId} connected`);
    userSockets[userId] = socket.id; // Save the user's socket ID
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  socket.on("call-user", ({ calleeId, roomId }) => {
    console.log(`Calling user ${calleeId} in room ${roomId}`);
    socket.join(roomId);

    const calleeSocket = userSockets[calleeId];
    console.log(userSockets);

    if (calleeSocket) {
      io.to(calleeSocket).emit("incoming-call", { from: socket.id, roomId });
      console.log(`Calling user ${calleeSocket} in room ${roomId}`);
    }
  });

  socket.on("accept-call", ({ callerId, roomId }) => {
    console.log(`✅ Call accepted by ${socket.id}, joining room ${roomId}`);
    socket.join(roomId);
    io.to(callerId).emit("call-accepted", { from: socket.id, roomId });
  });

  socket.on("reject-call", ({ callerId }) => {
    console.log(`❌ Call rejected by ${socket.id}`);
    io.to(callerId).emit("call-rejected", { from: socket.id });
  });

  socket.on("end-call", ({ roomId }) => {
    console.log(`📴 Call ended by ${socket.id}`);
    socket.to(roomId).emit("call-ended", { from: socket.id });
  });

  // === WebRTC signaling events ===

  socket.on("offer", ({ offer, roomId }) => {
    console.log(`📤 Offer from ${socket.id} to room ${roomId}`);
    socket.to(roomId).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, roomId }) => {
    console.log(`📤 Answer from ${socket.id} to room ${roomId}`);
    socket.to(roomId).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ candidate, roomId }) => {
    // console.log(`📡 ICE candidate from ${socket.id} to room ${roomId}`);
    socket.to(roomId).emit("ice-candidate", { candidate, from: socket.id });
  });

  // === Disconnection handling ===

  socket.on("disconnecting", () => {
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    rooms.forEach((roomId) => {
      console.log(`↪️ ${socket.id} leaving room ${roomId}`);
      socket.to(roomId).emit("user-left", socket.id);
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.id}`);
  });
});
const PORT = parseInt(process.env.PORT || "3003", 10);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
