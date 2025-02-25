import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../model/user-model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true, // Allow credentials
  },
});

// Store user socket mapping
const userSocketMap = {};
let waitingUsers = [];

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Get userId from query params
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  socket.on("find-match", async ({ id }) => {
    let reciever = null;
    let caller = id;
    const user = await User.findOne({ _id: id });
    const userEmbedding = user.embedding;

    let candidates = waitingUsers.filter((user) => user !== id);

    for (let i = 0; i < candidates.length; i++) {
      const candidate = await User.findOne({ _id: candidates[i] });
      const candidateEmbedding = candidate.embedding;

      const cosineSimilarity = calculateCosineSimilarity(
        userEmbedding,
        candidateEmbedding
      );

      if (cosineSimilarity > 0.5) {
        console.log("Candidate found with similarity:", cosineSimilarity);
        reciever = candidate.id;
        console.log("reciever-->", reciever);
        waitingUsers.splice(i, 1);
        break;
      }
    }

    if (reciever) {
      console.log("Match found, notifying users...");
      io.to(userSocketMap[reciever]).emit("match-found", {
        match: userSocketMap[caller],
        role: "reciever",
      });
      io.to(userSocketMap[caller]).emit("match-found", {
        match: userSocketMap[reciever],
        role: "caller",
      });
    } else {
      if (!waitingUsers.includes(id)) {
        waitingUsers.push(id);
      }
      console.log("user added to waiting list", id);
    }
  });

  // senders peer connection communication hai ye
  socket.on("sp-send-offer", ({ sdp, to }) => {
    io.to(to).emit("sp-receive-offer", { sdp });
  });

  socket.on("sp-send-answer", ({ sdp, to }) => {
    io.to(to).emit("sp-receive-answer", { sdp });
  });

  socket.on("sp-send-ice-candidate", ({ candidate, to }) => {
    io.to(to).emit("sp-receive-ice-candidate", { candidate });
  });

  // reciever peer connection communication hai ye

  socket.on("rp-send-offer", ({ sdp, to }) => {
    io.to(to).emit("rp-receive-offer", { sdp });

    console.log(" offer sended to", to);
  });

  socket.on("rp-send-answer", ({ sdp, to }) => {
    io.to(to).emit("rp-receive-answer", { sdp });
  });

  socket.on("rp-send-ice-candidate", ({ candidate, to }) => {
    io.to(to).emit("rp-receive-ice-candidate", { candidate });
  });

  // callendong socket

  socket.on("end-call", ({ to, msg }) => {
    io.to(to).emit("ended-call", { msg });
  });

  socket.on("send-message", ({ msg, to }) => {
    io.to(to).emit("recieve-message", { msg, to });
    console.log("message sended ", msg ,to)
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected ->", socket.id);
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected ->", socket.id);

    // Remove user from userSocketMap
    for (const user in userSocketMap) {
      if (userSocketMap[user] === socket.id) {
        delete userSocketMap[user];
        break;
      }
    }
  });
});

const getOnlineUsers = () => Object.keys(userSocketMap);

const calculateCosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

export { io, server, app, getOnlineUsers };
