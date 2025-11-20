// app/(tabs)/JoinSession.js
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import axios from "axios";

export default function JoinSession() {
  const [session, setSession] = useState(null);
  const [side, setSide] = useState("Heads");
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const fetchCurrentSession = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/session/current", {
        headers: { Authorization: "Bearer user-token" },
      });
      if (res.data.session) {
        setSession(res.data.session);
        const diff = new Date(res.data.session.startTime) - new Date();
        setCountdown(Math.floor(diff / 1000));
      }
    } catch (err) {
      console.error("Fetch session error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/session/join",
        {
          sessionId: session._id,
          sideChosen: side,
          amount: Number(amount),
        },
        {
          headers: { Authorization: "Bearer user-token" },
        }
      );
      setJoined(true);
    } catch (err) {
      alert("Join failed: " + err.response?.data?.message || "Server error");
    }
  };

  useEffect(() => {
    fetchCurrentSession();
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007bff" />;

  if (!session) return <Text style={{ textAlign: "center", marginTop: 50 }}>No session available right now.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>⏳ Flip in: {countdown} sec</Text>
      <Text style={styles.label}>Select Side:</Text>
      <View style={styles.choiceRow}>
        <TouchableOpacity style={[styles.choice, side === "Heads" && styles.selected]} onPress={() => setSide("Heads")}>
          <Text>Heads</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.choice, side === "Tails" && styles.selected]} onPress={() => setSide("Tails")}>
          <Text>Tails</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Bet Amount:</Text>
      <TextInput style={styles.input} value={String(amount)} onChangeText={setAmount} keyboardType="numeric" />

      <TouchableOpacity style={styles.button} onPress={handleJoin} disabled={joined}>
        <Text style={styles.buttonText}>{joined ? "Joined" : "Join Bet"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  timer: { fontSize: 22, textAlign: "center", marginBottom: 20 },
  label: { fontWeight: "bold", marginTop: 20 },
  choiceRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  choice: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    width: "40%",
    alignItems: "center",
  },
  selected: { backgroundColor: "#add8e6" },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#007bff",
    marginTop: 30,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
