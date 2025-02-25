import "./App.css";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Navbar from "./pages/Navbar";
import Register from "./pages/Register";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore.js";
import VideoCall from "./pages/VideoCall";

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if ( !authUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className=" text-info h-20 w-20"> Loading ... </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-violet-600 pb-2 md:h-screen ">
     
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
          <Route
          path="/videocall"
          element={authUser ? <VideoCall /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <Register /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <Login /> : <Navigate to="/" />}
        />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
