import React, { useState, useRef, useEffect } from "react";
import { Mic, StopCircle } from "lucide-react"; // Import icons from lucide-react
import useIntrestStore from "../store/useIntrestStore.js"; // Import the Zustand store
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom

const VoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [AudioBlob, setAudioBlob] = useState(null);
  const { setAudioURL, sendAudioToBackend } = useIntrestStore();
  const navigate = useNavigate(); // Initialize useNavigate

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);

        setAudioURL(url);
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleSubmit = async () => {
    console.log("AudioBlob:", AudioBlob);
    const responseStatus = await sendAudioToBackend(AudioBlob);

    if (responseStatus === 200) {
      navigate("/videocall"); // Navigate to the video call page
    }
  }; 
  const handleSkip= ()=>{
    navigate("/videocall");
  }
  const audioURL = useIntrestStore((state) => state.audioURL);

  return (
    <div className="p-4 w-full md:max-w-lg ">
      <div className="flex items-center justify-center">
        {!recording ? (
          <button
            onClick={startRecording}
            className="flex items-center justify-center p-2 bg-blue-500 hover:bg-blue-700 text-white rounded-full"
          >
            <Mic size={30} />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center justify-center p-2 bg-red-500 hover:bg-red-700 text-white rounded-full"
          >
            <StopCircle size={30} />
          </button>
        )}
      </div>
      {audioURL && (
        <div className="mt-8 flex flex-col items-center">
          <h3 className="text-2xl font-semibold">Playback</h3>
          <audio src={audioURL} controls className="mt-5" />
          <button
            onClick={handleSubmit}
            className="flex items-center justify-center px-8 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-700 hover:to-orange-700 text-white rounded-2xl mt-5"
          >
            Submit
          </button>
        </div>
      )}
      <div className="flex flex-col justify-center items-center w-full mt-5 ">
        <p className="text-lg text-center md:text-xl">if you have recorded your Intrest in past then skip</p>
        <button
            onClick={handleSkip}
            className="flex items-center justify-center px-8 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-700 hover:to-orange-700 text-white rounded-2xl mt-5"
          >
            Skip
          </button>
      </div>
    </div>
  );
};

export default VoiceRecorder;