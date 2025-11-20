// app/(tabs)/history.js
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import axios from "axios";

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/coin/history", {
        headers: { Authorization: "Bearer user-token" },
      });
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch error", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.round}>Round #{item.roundId}</Text>
      <Text>Bet: {item.side} | Amount: ₹{item.amount}</Text>
      <Text>Result: {item.result} | {item.result === item.side ? "✅ Win" : "❌ Loss"}</Text>
        <Text style={styles.status}>
              {item.didWin ? "✅ Won" : "❌ Lost"} on {new Date(item.createdAt).toLocaleString()}
            </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Bet History</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No bets yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 14,
    marginBottom: 12,
    borderRadius: 8,
  },
  round: {
    fontWeight: "bold",
    marginBottom: 4,
  },
});
