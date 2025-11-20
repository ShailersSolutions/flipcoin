// app/(tabs)/SupportChat.js
import { useEffect, useState } from "react";
import { View, TextInput, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function SupportChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState("user123"); // TODO: Replace with auth user ID

  useEffect(() => {
    socket.emit("joinRoom", { room: userId });
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.disconnect();
  }, []);
useEffect(() => {
  socket.on("notify", (data) => {
    alert(data.message); // Replace with toast/modal for better UX
  });
}, []);

  const sendMessage = () => {
    if (!input) return;
    const msg = { sender: userId, text: input, timestamp: new Date() };
    socket.emit("sendMessage", { room: userId, msg });
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={[styles.message, item.sender === userId ? styles.right : styles.left]}
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
          placeholder="Type your message..."
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
