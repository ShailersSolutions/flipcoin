// app/(admin)/SessionMonitor.js
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import axios from "axios";

export default function SessionMonitor() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flipping, setFlipping] = useState(false);

  const fetchCurrent = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/session/current", {
        headers: { Authorization: "Bearer admin-token" },
      });
      setSession(res.data.session);
    } catch (err) {
      console.error("Error fetching session", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlipNow = async () => {
    setFlipping(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/session/complete",
        { sessionId: session._id },
        {
          headers: { Authorization: "Bearer admin-token" },
        }
      );
      alert("Result: " + res.data.result);
      fetchCurrent();
    } catch (err) {
      alert("Flip failed");
    } finally {
      setFlipping(false);
    }
  };

  useEffect(() => {
    fetchCurrent();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="blue" />;

  if (!session) return <Text style={{ marginTop: 50, textAlign: "center" }}>No active session.</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>🎯 Live Flip Session</Text>
      <Text>Status: {session.status}</Text>
      <Text>Start Time: {new Date(session.startTime).toLocaleString()}</Text>
      <Text>Participants: {session.participants.length}</Text>

      {session.participants.map((p, idx) => (
        <View key={idx} style={styles.card}>
          <Text>User: {p.userId?.username || "-"}</Text>
          <Text>Side: {p.sideChosen}</Text>
          <Text>Amount: ₹{p.amount}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={handleFlipNow}
        disabled={flipping || session.status !== "pending"}
      >
        <Text style={styles.buttonText}>{flipping ? "Flipping..." : "Flip Now"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#ff4d4d",
    padding: 14,
    marginTop: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
