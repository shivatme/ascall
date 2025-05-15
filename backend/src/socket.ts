import { Server } from "socket.io";

let userSockets: { [userId: string]: string } = {};

export const initSocket = (io: Server) => {
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
      console.log(callerId);
      io.to(callerId).emit("call-rejected", { from: socket.id });
    });

    socket.on("end-call", ({ calleeId }) => {
      console.log(`📴 Call ended by ${socket.id}`);
      const calleeSocket = userSockets[calleeId];
      socket.to(calleeSocket).emit("call-ended", { from: socket.id });
    });
    socket.on("end-call-room", ({ roomId }) => {
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
};
