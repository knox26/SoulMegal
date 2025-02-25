import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey:"a0c16cc2c6a14184a5e94b89939d31d0" // Use the API key from the .env file
});

export const extractAudio = async (req, res, next) => {
  try {
    const audioFile = req.file;
    if (!audioFile) {
      console.error("No audio file provided");
      return res.status(400).json({ message: "No audio file provided" });
    }

    async function transcribeAudio(audioFile) {
      const transcript = await client.transcripts.transcribe({
        audio: audioFile.buffer,
      });

      const completedTranscript = await client.transcripts.waitUntilReady(
        transcript.id
      );
      console.log("Transcription completed:", completedTranscript.text);

      const finalTranscript = completedTranscript.text;

      // Attach the transcription to the request object for further processing
      req.transcription = finalTranscript;
      next();
    }

    transcribeAudio(audioFile).catch((error) => {
      console.error("Error transcribing audio:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
  } catch (error) {
    console.error("Error extracting audio:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
