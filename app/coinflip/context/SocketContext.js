import { createContext, useContext, useEffect } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socket = io("http://your-server-ip:PORT");

  useEffect(() => {
    return () => socket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
