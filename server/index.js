import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDb from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";

import authRoute from "./routes/authRoute.js";
import sessionRoute from "./routes/sessionRoute.js";

// ✅  Stream import (CommonJS safe)
import pkg from "stream-chat";
const { StreamChat } = pkg;

dotenv.config();

const app = express();

/**
 * PORT
 */
const PORT = process.env.PORT || 5000;

/**
 * DATABASE CONNECTION
 */
connectDb();

/**
 * CORS CONFIG
 */
const corsOption = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};

app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * HEALTH CHECK
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Live class server is running",
    timestamp: new Date().toISOString(),
  });
});

/**
 * STREAM CLIENT SETUP
 */
const streamClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

/**
 * STREAM TOKEN ROUTE
 */
app.post("/api/stream/token", (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // ✅ correct method
    const token = streamClient.createToken(userId);

    return res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Stream token error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate Stream token",
    });
  }
});

/**
 * AUTH ROUTES
 */
app.use("/api/auth", authRoute);
app.use("/api/session", sessionRoute);

/**
 * ERROR HANDLER
 */
app.use(errorHandler);

/**
 * START SERVER
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});