import { Server } from "socket.io";

let userSockets: { [userId: string]: string } = {};
function getUserIdFromSocketId(socketId: string): string | undefined {
  return Object.keys(userSockets).find(
    (userId) => userSockets[userId] === socketId
  );
}

export const initSocket = (io: Server) => {
  io.on("connection", (socket) => {
    // console.log(`✅ Connected: ${socket.id}`);

    // === Call lifecycle events ===
    // Assuming users have a userId they send upon connecting:
    socket.on("register-user", (userId) => {
      console.log(`User ${userId} connected`);
      userSockets[userId] = socket.id; // Save the user's socket ID
      console.log(`User ${userId} registered with socket ID ${socket.id}`);
    });

    socket.on("call-user", async ({ calleeId, roomId }) => {
      console.log(`Calling user ${calleeId} in room ${roomId}`);
      socket.join(roomId);
      console.log(userSockets, calleeId);
      const calleeSocket = userSockets[calleeId];
      const callerId = getUserIdFromSocketId(socket.id);
      if (!callerId) return;
      if (calleeSocket) {
        io.to(calleeSocket).emit("incoming-call", {
          from: socket.id,
          callerId,
          roomId,
        });
        console.log(`Calling user ${calleeSocket} in room ${roomId}`);
        await sendCallPushNotification(calleeId, callerId, roomId);
      } else {
        console.log(`User ${calleeId} is offline. Triggering push.`);

        // 🟡 Trigger a fallback push notification via HTTP call or inline logic
        await sendCallPushNotification(calleeId, callerId, roomId);
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
import { PrismaClient } from "@prisma/client";
import admin from "./config/firebase";

const prisma = new PrismaClient();

async function sendCallPushNotification(
  calleeId: string,
  callerId: string,
  roomId: string
) {
  const user = await prisma.user.findUnique({
    where: { phone: `+91${calleeId}` },
  });
  if (user) {
    const fcmToken = await prisma.fcmToken.findFirst({
      where: { userId: user.id },
    });

    console.log(calleeId, fcmToken);
    if (fcmToken) {
      console.log(callerId);
      const res = await admin.messaging().send({
        token: fcmToken.token,

        data: {
          title: "Incoming Call",
          // from: callerId?.toString(),
          calleeId,
          body: "You have an incoming video call from " + callerId,
          type: "CALL",
          roomId: roomId?.toString(),
        },
        android: {
          priority: "high",
        },
      });
      console.log(res);
    }
  }

  // if (!deviceToken) return;

  // const message = {
  //   to: deviceToken,
  //   data: {
  //     type: "INCOMING_CALL",
  //     callerId,
  //     roomId,
  //   },
  //   notification: {
  //     title: "Incoming Call",
  //     body: "You have a new call",
  //   },
  // };

  // await fetch('https://fcm.googleapis.com/fcm/send', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(message),
  // });
}
