// app/(admin)/UserChats.js
import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";

export default function UserChats({ navigation }) {
  const [chats, setChats] = useState([]);

  const fetchChats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/chat-users", {
        headers: { Authorization: "Bearer admin-token" },
      });
      setChats(res.data.users);
    } catch (err) {
      alert("Failed to load chat users");
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Text style={styles.title}>👥 User Chat Sessions</Text>
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("ChatRoom", { userId: item._id, username: item.name })}
          >
            <Text style={styles.username}>{item.name}</Text>
            <Text style={styles.meta}>Last Msg: {item.lastMessage}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#f4f4f4",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  username: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 12, color: "gray" },
});
