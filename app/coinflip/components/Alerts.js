// app/(admin)/Alerts.js
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import axios from "axios";

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/alerts", {
        headers: { Authorization: "Bearer admin-token" },
      });
      setAlerts(res.data.alerts);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#ff0000" />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>🚨 Suspicious Activity Alerts</Text>

      {alerts.length === 0 ? (
        <Text style={styles.info}>No suspicious behavior detected ✅</Text>
      ) : (
        alerts.map((alert, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.username}>👤 {alert.username}</Text>
            <Text>Win Rate: {alert.winRate}</Text>
            <Text>Total Flips: {alert.flips}</Text>
            <Text>Reason: {alert.reason}</Text>
            <Text style={styles.timestamp}>🕒 Flagged At: {new Date(alert.flaggedAt).toLocaleString()}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#ffe5e5",
    borderLeftWidth: 4,
    borderColor: "#ff4d4d",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  username: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
  timestamp: { marginTop: 5, color: "#555", fontSize: 12 },
  info: { fontSize: 16, color: "green" },
});
