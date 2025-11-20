import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import axios from "../utils/api";

const StatsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get("/coin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  if (!stats) {
    return <Text style={styles.error}>Could not load stats</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lifetime Stats</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Total Flips:</Text>
        <Text style={styles.value}>{stats.totalFlips}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Wins:</Text>
        <Text style={[styles.value, { color: "green" }]}>{stats.wins}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Losses:</Text>
        <Text style={[styles.value, { color: "red" }]}>{stats.losses}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Win Rate:</Text>
        <Text style={styles.value}>{stats.winRate}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Total Earned:</Text>
        <Text style={styles.value}>₹{stats.totalEarned}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Total Lost:</Text>
        <Text style={styles.value}>₹{stats.totalLost}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: { fontSize: 16, fontWeight: "bold", color: "#555" },
  value: { fontSize: 16, fontWeight: "bold" },
  error: { textAlign: "center", color: "red", marginTop: 50 },
});

export default StatsScreen;
