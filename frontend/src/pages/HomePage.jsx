import React from "react";
import VoiceRecorder from "../components/VoiceRecorder.jsx"; // Import the VoiceRecorder component

function HomePage() {
  return (
    <div className="p-20 flex flex-col items-center justify-center h-full">
      <h1 className="text-6xl mb-10">Record Your Interest</h1>
      <VoiceRecorder /> {/* Add the VoiceRecorder component */}
    </div>
  );
}

export default HomePage;
