// app/game/join.js
import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from "react-native";
import { GameContext } from "../../context/GameContext";
import { router } from "expo-router";

const JoinRoomScreen = () => {
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState(["alpha", "beta", "gamma"]); // Example list
  const { joinRoom } = useContext(GameContext);

  const handleJoin = (id) => {
    joinRoom(id);
    router.push("/game/room");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🎮 Join a Game Room</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Room ID"
        value={roomId}
        onChangeText={setRoomId}
      />
      <TouchableOpacity style={styles.btn} onPress={() => handleJoin(roomId)}>
        <Text style={styles.btnText}>Join</Text>
      </TouchableOpacity>

      <Text style={styles.subheading}>Or select an existing room:</Text>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.roomCard} onPress={() => handleJoin(item)}>
            <Text style={styles.roomText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subheading: { fontSize: 18, marginVertical: 10 },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    borderColor: "#ccc",
  },
  btn: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  btnText: { color: "white", fontWeight: "bold" },
  roomCard: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginVertical: 6,
  },
  roomText: { fontSize: 16 },
});

export default JoinRoomScreen;
