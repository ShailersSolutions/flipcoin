// app/(admin)/TopPlayers.js
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import axios from "axios";

export default function TopPlayers() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/top-players", {
        headers: { Authorization: "Bearer admin-token" },
      });
      setData(res.data);
    } catch (err) {
      console.error("Error fetching top players", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007bff" />;

  const renderList = (title, items, keyName, valueKey) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text>{index + 1}. {item.username || item.userId}</Text>
          <Text>{valueKey}: {item[valueKey]}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Top Players Analytics</Text>

      {renderList("🏆 Top Earners", data.topEarners, "username", "totalWinnings")}
      {renderList("🔥 Longest Win Streaks", data.winStreaks, "userId", "streak")}
      {renderList("😓 Most Losses", data.mostLosses, "username", "losses")}
      {renderList("💰 High Betters", data.highBetters, "username", "totalBet")}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#e8f0fe",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
});
