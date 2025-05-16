import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { initSocket } from "./socket";
import router from "./route";
import authRouter from "./routes/auth.routes";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow cross-origin requests
    methods: ["GET", "POST"],
  },
});
initSocket(io);
// Serve static HTML files from 'public' folder
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api", router);
app.use("/api/auth", authRouter);

const PORT = parseInt(process.env.PORT || "3003", 10);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
