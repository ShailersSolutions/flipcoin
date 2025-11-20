// app/(tabs)/leaderboard.js
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import api from "../../../utils/api";

const LeaderboardScreen = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/leaderboard");
        setLeaders(res.data);
      } catch (err) {
        console.error("Leaderboard error", err);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🏆 Leaderboard</Text>
      <FlatList
        data={leaders}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.stats}>Wins: {item.totalWins} | Earnings: ₹{item.totalEarnings}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No leaders yet</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  rank: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 12,
    color: "#ffd700",
  },
  name: { fontSize: 16, fontWeight: "bold" },
  stats: { fontSize: 14, color: "#555" },
  empty: { textAlign: "center", marginTop: 40, color: "#999" },
});

export default LeaderboardScreen;
