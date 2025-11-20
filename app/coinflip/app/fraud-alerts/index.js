// app/fraud-alerts/index.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import axios from "axios";

const FraudAlertsScreen = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const res = await axios.get("/admin/fraud-alerts");
      setAlerts(res.data);
    };
    fetchAlerts();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.username}>User: {item.username}</Text>
      <Text style={styles.reason}>⚠️ {item.reason}</Text>
      <Text style={styles.detail}>Probability: {Math.round(item.riskScore * 100)}%</Text>
      <Text style={styles.detail}>Last Seen: {new Date(item.lastActivity).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🚨 Fraud Alerts</Text>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  card: {
    backgroundColor: "#fff7f7",
    borderColor: "#ffcccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  username: { fontSize: 16, fontWeight: "bold" },
  reason: { color: "red", marginVertical: 4 },
  detail: { fontSize: 14, color: "#555" },
});

export default FraudAlertsScreen;
