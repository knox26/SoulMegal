import React from "react";
import VoiceRecorder from "../components/VoiceRecorder.jsx"; // Import the VoiceRecorder component

function HomePage() {
  return (
    <div className="p-20 flex flex-col items-center justify-center h-screen w-screen ">
      <h1 className="text-3xl md:text-6xl mb-3 md:mb-10 w-full text-center">
        Record Your Interest
      </h1>
      <VoiceRecorder />
    </div>
  );
}

export default HomePage;
