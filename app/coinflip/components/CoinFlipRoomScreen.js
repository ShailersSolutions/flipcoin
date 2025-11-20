// frontend/screens/CoinFlipRoomScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, Button, TouchableOpacity, StyleSheet } from "react-native";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://YOUR_BACKEND_URL");

const CoinFlipRoomScreen = ({ userId }) => {
  const [room, setRoom] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [choice, setChoice] = useState(null);
  const [betPlaced, setBetPlaced] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Fetch active room
    axios.get("/coin/active-room").then((res) => setRoom(res.data.room));

    socket.on("timer", (time) => setTimeLeft(time));
    socket.on("newRoom", (data) => {
      setRoom({ _id: data.roomId });
      setTimeLeft(data.time);
      setResult(null);
      setBetPlaced(false);
      setChoice(null);
    });
    socket.on("flipResult", ({ result }) => setResult(result));
  }, []);

  const placeBet = async () => {
    if (!choice) return;
    await axios.post("/coin/join-room", {
      userId,
      amount: 100,
      choice,
    });
    setBetPlaced(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>⏳ Time Left: {timeLeft}s</Text>
      <Text style={styles.heading}>Current Room ID: {room?._id}</Text>

      {result ? (
        <Text style={styles.result}>🎉 Result: {result}</Text>
      ) : betPlaced ? (
        <Text style={styles.waiting}>Waiting for flip result...</Text>
      ) : (
        <>
          <View style={styles.buttons}>
            <TouchableOpacity onPress={() => setChoice("Heads")} style={[styles.choice, choice === "Heads" && styles.selected]}>
              <Text style={styles.choiceText}>Heads</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setChoice("Tails")} style={[styles.choice, choice === "Tails" && styles.selected]}>
              <Text style={styles.choiceText}>Tails</Text>
            </TouchableOpacity>
          </View>
          <Button title="Place Bet (₹100)" onPress={placeBet} disabled={!choice || betPlaced} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", alignItems: "center" },
  timer: { fontSize: 20, marginBottom: 10 },
  heading: { fontSize: 16, marginBottom: 20 },
  result: { fontSize: 24, fontWeight: "bold", color: "green" },
  waiting: { fontSize: 16, color: "gray" },
  buttons: { flexDirection: "row", marginBottom: 20 },
  choice: { padding: 15, backgroundColor: "#ccc", marginHorizontal: 10, borderRadius: 8 },
  selected: { backgroundColor: "#007BFF" },
  choiceText: { color: "white", fontWeight: "bold" },
});

export default CoinFlipRoomScreen;
