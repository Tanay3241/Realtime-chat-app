// lib/socket.js

import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Online users map
const userSocketMap = {}; // { userId: socketId }

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    credentials: true, // Needed for cookies/auth
  },
});

// Utility function to get receiver's socket ID
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("✅ A user connected:", socket.id, "| User ID:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  // Optional: logging user-sent messages
  socket.on("message", (data) => {
    console.log("📨 Message received:", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);

    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };
