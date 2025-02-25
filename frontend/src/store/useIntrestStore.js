import { create } from "zustand";
import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

const useIntrestStore = create((set) => ({
  audioURL: null,
  setAudioURL: (url) => set({ audioURL: url }),
  sendAudioToBackend: async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await axios.post(
        `${BASE_URL}api/upload/upload-audio`, // Corrected API endpoint
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // Ensure credentials are sent with the request
        }
      );

      if (response.status === 200) {
        console.log("Audio uploaded successfully", response);
        return response.status;
      } else {
        console.error("Failed to upload audio");
        return response.status;
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
      return 500;
    }
  },
}));

export default useIntrestStore;
