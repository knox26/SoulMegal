import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";


const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  socket: null,
  isCheckingAuth: true,
  match: null,
  role: null,

  setMatch: (match) => {
    set({ match });
  },

  setRole:(role)=>{
    set({role});
  },

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const response = await axiosInstance.get("/auth/check");
      set({ authUser: response.data });
      console.log("checkAuth response in authStore.js", response.data);
      get().connectSocket();
    } catch (error) {
      console.log("checkAuth error in authStore.js", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      const response = await axiosInstance.post("/auth/signup", formData);

      set({ authUser: response.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      console.log("signup error in authStore.js", error.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (formData) => {
    set({ isLoggingIn: true });
    try {
      const response = await axiosInstance.post("/auth/login", formData);
      set({ authUser: response.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("login error in authStore.js", error.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error("Something went wrong");
      console.log("logout error in authStore.js", error.message);
    }
  },

  connectSocket: () => {
    const { authUser } = get();

    if (!authUser || get().socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    const socket = io(BASE_URL, {
      query: { userId: authUser._id },
      withCredentials: true,
    });
    set({ socket: socket });
    socket.connect();
    console.log("Socket connected");

  },

  disconnectSocket: () => {
    if (get().socket) {
      get().socket.disconnect();
      set({ socket: null });
    }
  },
}));
