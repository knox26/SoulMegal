import express from "express";
import multer from "multer";
import { protectRoute } from "../middleware/auth-middleware.js";
import { extractAudio } from "../middleware/extractAudio.js"; // Import the extractAudio middleware
import { uploadIntrest } from "../controller/upload-controller.js"; // Import the upload controller

const router = express.Router();

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/upload-audio",
  protectRoute,
  upload.single("audio"), // Use multer to handle file uploads
  extractAudio,
  uploadIntrest
);

export default router;
