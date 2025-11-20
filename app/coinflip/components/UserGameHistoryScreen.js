// frontend/screens/UserGameHistoryScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import axios from "axios";

const UserGameHistoryScreen = ({ userId }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await axios.get(`/coin/user-history/${userId}`);
      setHistory(res.data.history);
    };
    fetchHistory();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.result}>
        {item.result === item.choice ? "✅ Win" : "❌ Loss"} ({item.choice})
      </Text>
      <Text style={styles.amount}>Amount: ₹{item.amount}</Text>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧾 Game History</Text>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  list: { paddingBottom: 50 },
  item: { marginBottom: 12, padding: 12, backgroundColor: "#f1f1f1", borderRadius: 8 },
  result: { fontSize: 18, fontWeight: "bold" },
  amount: { fontSize: 16 },
  date: { fontSize: 14, color: "gray" },
});

export default UserGameHistoryScreen;
