// app/(admin)/ChatRoom.js
import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ChatRoom() {
  const route = useRoute();
  const { userId, username } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const sender = "admin";
  
useEffect(() => {
  socket.emit("joinAdmin");
  socket.on("notify", (data) => {
    alert(data.message); // Show incoming user messages
  });
}, []);

  useEffect(() => {
    socket.emit("joinRoom", { room: userId });
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.disconnect();
  }, []);

  const sendMessage = () => {
    if (!input) return;
    const msg = { sender, text: input, timestamp: new Date() };
    socket.emit("sendMessage", { room: userId, msg });
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat with {username}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={[styles.message, item.sender === sender ? styles.right : styles.left]}
          >
            <Text>{item.text}</Text>
            <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a reply..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: "white" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  message: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 10,
    maxWidth: "80%",
  },
  left: { backgroundColor: "#eee", alignSelf: "flex-start" },
  right: { backgroundColor: "#007bff", alignSelf: "flex-end", color: "white" },
  time: { fontSize: 10, color: "gray", marginTop: 4 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
});
