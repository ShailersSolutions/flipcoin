// app/(tabs)/WalletHistory.js
import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";

export default function WalletHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/wallet/history", {
        headers: { Authorization: "Bearer user-token" },
      });
      setTransactions(res.data.transactions);
    } catch (err) {
      alert("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="green" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📄 Wallet History</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.type === "credit" ? "💰 Credit" : "💸 Debit"}</Text>
            <Text>Amount: ₹{item.amount}</Text>
            <Text>{item.reason}</Text>
            <Text style={{ fontSize: 12 }}>{new Date(item.date).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
});
