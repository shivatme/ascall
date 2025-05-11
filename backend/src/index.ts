import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";

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
  // console.log("New user connected");

  socket.on("join", (room) => {
    // console.log("User joined room", room);
    socket.join(room);
    socket.to(room).emit("user-joined");
  });

  socket.on("offer", (offer, room) => {
    console.log("offer");
    socket.to(room).emit("offer", offer);
  });

  socket.on("answer", (answer, room) => {
    console.log("answer");
    socket.to(room).emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate, room) => {
    console.log("ice-candidate");
    socket.to(room).emit("ice-candidate", candidate);
  });
});

const PORT = parseInt(process.env.PORT || "3000", 10);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
