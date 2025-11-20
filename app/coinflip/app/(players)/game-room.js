// app/(tabs)/game-room.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from "react-native";
import { io } from "socket.io-client";
import { useLocalSearchParams } from "expo-router";
import { getToken } from "../../utils/api";

const socket = io("http://localhost:5000", {
  auth: async (cb) => cb({ token: await getToken() }),
  autoConnect: false,
});

const GameRoomScreen = () => {
  const [joinedUsers, setJoinedUsers] = useState([]);
  const [betAmount, setBetAmount] = useState("");
  const [side, setSide] = useState(null);
  const [roomStatus, setRoomStatus] = useState("waiting");
  const [flipResult, setFlipResult] = useState(null);

  useEffect(() => {
    socket.connect();

    socket.on("room:update", ({ users }) => setJoinedUsers(users));
    socket.on("room:status", ({ status }) => setRoomStatus(status));
    socket.on("flip:result", ({ result }) => setFlipResult(result));

    return () => {
      socket.disconnect();
    };
  }, []);

  const placeBet = () => {
    const num = parseFloat(betAmount);
    if (!num || num <= 0 || !side) {
      Alert.alert("Please select side and valid amount");
      return;
    }
    socket.emit("bet:place", { amount: num, side });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🪙 Game Room</Text>

      <Text style={styles.label}>Choose Side:</Text>
      <View style={styles.sideRow}>
        <TouchableOpacity
          style={[styles.sideBtn, side === "Heads" && styles.activeBtn]}
          onPress={() => setSide("Heads")}
        >
          <Text style={styles.sideText}>Heads</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sideBtn, side === "Tails" && styles.activeBtn]}
          onPress={() => setSide("Tails")}
        >
          <Text style={styles.sideText}>Tails</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Enter bet amount"
        keyboardType="numeric"
        style={styles.input}
        value={betAmount}
        onChangeText={setBetAmount}
      />

      <TouchableOpacity style={styles.betBtn} onPress={placeBet}>
        <Text style={styles.betText}>Place Bet</Text>
      </TouchableOpacity>

      <Text style={styles.status}>Room Status: {roomStatus.toUpperCase()}</Text>

      {flipResult && (
        <Text style={styles.result}>🎉 Flip Result: {flipResult}</Text>
      )}

      <Text style={styles.subheading}>Players Joined:</Text>
      <FlatList
        data={joinedUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Text style={styles.userItem}>👤 {item.name} — ₹{item.betAmount} on {item.side}</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  label: { fontSize: 16, marginBottom: 4 },
  sideRow: { flexDirection: "row", marginBottom: 10 },
  sideBtn: {
    flex: 1,
    padding: 10,
    backgroundColor: "#eee",
    marginHorizontal: 4,
    borderRadius: 6,
    alignItems: "center",
  },
  activeBtn: { backgroundColor: "#007bff" },
  sideText: { color: "#000", fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  betBtn: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 10,
  },
  betText: { color: "#fff", fontWeight: "bold" },
  status: { fontSize: 14, marginBottom: 6, color: "#555" },
  result: { fontSize: 18, fontWeight: "bold", color: "#dc3545", marginBottom: 10 },
  subheading: { fontSize: 16, fontWeight: "bold", marginVertical: 10 },
  userItem: { fontSize: 14, paddingVertical: 4 },
});

export default GameRoomScreen;
