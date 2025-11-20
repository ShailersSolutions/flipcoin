// context/GameContext.js
import React, { createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [bet, setBet] = useState(null);
  const [side, setSide] = useState("Heads");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("waiting"); // 'waiting', 'flipping', 'result'

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("connect", () => console.log("Socket connected"));

    newSocket.on("player-joined", (data) => setPlayers(data));
    newSocket.on("flip-started", () => setStatus("flipping"));
    newSocket.on("flip-result", (outcome) => {
      setResult(outcome);
      setStatus("result");
    });

    return () => newSocket.disconnect();
  }, []);

  const joinRoom = (roomId) => {
    if (!socket) return;
    socket.emit("join-room", roomId);
    setRoomId(roomId);
  };

  const placeBet = (amount, selectedSide) => {
    if (!socket || !roomId) return;
    setBet(amount);
    setSide(selectedSide);
    socket.emit("place-bet", { roomId, amount, side: selectedSide });
  };

  return (
    <GameContext.Provider
      value={{
        socket,
        roomId,
        players,
        bet,
        side,
        result,
        status,
        joinRoom,
        placeBet,
        setStatus,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
