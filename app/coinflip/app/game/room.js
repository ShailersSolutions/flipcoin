// app/game/room.js
import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { GameContext } from "../../context/GameContext";
import { router } from "expo-router";

const GameRoomScreen = () => {
  const { roomId, players, socket, status } = useContext(GameContext);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (status === "waiting") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            socket.emit("start-flip", { roomId });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Room ID: {roomId}</Text>
      <Text style={styles.subheading}>🧑‍🤝‍🧑 Players in Room:</Text>

      <FlatList
        data={players}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.playerCard}>
            <Text>{item.name || "Player"}</Text>
            <Text>💰 Bet: {item.betAmount || 0}</Text>
            <Text>Side: {item.side || "-"}</Text>
          </View>
        )}
      />

      {status === "waiting" ? (
        <Text style={styles.countdown}>⏳ Flip in {countdown} seconds</Text>
      ) : status === "flipping" ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : null}

      <TouchableOpacity style={styles.leaveBtn} onPress={() => router.back()}>
        <Text style={styles.leaveText}>🔙 Leave Room</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  subheading: { fontSize: 18, marginVertical: 10 },
  countdown: { fontSize: 18, textAlign: "center", marginVertical: 20 },
  playerCard: {
    backgroundColor: "#e8e8e8",
    padding: 10,
    marginVertical: 6,
    borderRadius: 8,
  },
  leaveBtn: {
    marginTop: 30,
    alignSelf: "center",
  },
  leaveText: {
    color: "#dc3545",
    fontWeight: "bold",
  },
});

export default GameRoomScreen;
