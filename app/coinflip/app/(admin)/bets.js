import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import axios from "axios";

export default function AdminBets() {
  const [bets, setBets] = useState([]);

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/bets");
        setBets(res.data);
      } catch (err) {
        console.error("Error loading bets", err);
      }
    };
    fetchBets();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Bets</Text>
      <FlatList
        data={bets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.betBox}>
            <Text>User: {item.userId?.username || item.userId}</Text>
            <Text>Amount: ₹{item.amount}</Text>
            <Text>Side: {item.side}</Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  betBox: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 5,
  },
});
