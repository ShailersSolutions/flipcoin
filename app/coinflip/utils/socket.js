// utils/socket.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

const URL = "http://10.74.120.77:5000"; 

let socket;

export const connectSocket = async () => {
  const token = await AsyncStorage.getItem("token");
  socket = io(URL, {
    transports: ["websocket"],
    auth: {
      token,
    },
  });

  socket.on("connect", () => console.log("✅ Connected to Socket.IO server"));
  socket.on("disconnect", () => console.log("❌ Disconnected from server"));

  return socket;
};

export const getSocket = () => socket;
