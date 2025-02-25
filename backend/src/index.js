import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth-route.js";
import uploadRoute from "./routes/upload-route.js";
import { connectDB } from "./lib/Db-connection.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { app, server } from "./lib/socket.js";
import path from "path";

dotenv.config();
const PORT = process.env.PORT;

const __dirname = path.resolve();
// Increase the request body size limit
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoute); 

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("Server is running on port -->" + PORT);
  connectDB();
});
