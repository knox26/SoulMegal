import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../model/user-model.js";

export const uploadIntrest = async (req, res) => {
  try {
    const transcription = req.transcription;
    const email = req.user.email;
    if (!transcription) {
      console.error("No transcription provided");
      return res.status(400).json({ message: "No transcription provided" });
    }

    const API_KEY = process.env.GOOGLE_API_KEY;
    const genAI = new GoogleGenerativeAI(API_KEY);
    const prompt = `Extract user interests from this text: "${transcription}". Return only the interest names in a comma-separated format.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);

    const response = result.response.text();
    const interestsArray = response
      .split(",")
      .map((i) => i.trim().toLowerCase());

    // Find the user from the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's interests
    user.interests = interestsArray;
    await user.save();

    console.log("intrest array", interestsArray);

    console.log("going for embeding", response);

    const model1 = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result1 = await model1.embedContent(response);
    console.log(result1.embedding.values);

    const embedding = result1.embedding.values;

    user.embedding = embedding;

    await user.save();

    res.status(200).json({
      message: "Audio uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading audio:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
