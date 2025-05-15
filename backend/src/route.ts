import { Router } from "express";

const router = Router();

router.get("/status", (req, res) => {
  res.json({ status: "Server is running!" });
});

router.post("/example", (req, res) => {
  const { data } = req.body;
  res.json({ message: "Received data", data });
});

// Health check endpoint
router.get("/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});

export default router;
