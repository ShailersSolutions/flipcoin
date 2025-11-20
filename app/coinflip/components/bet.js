import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import axios from "axios";

export default function BetScreen() {
  const [side, setSide] = useState("Heads");
  const [amount, setAmount] = useState("");
  const [round, setRound] = useState(null);

  const fetchCurrentRound = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/coin/round/current");
      setRound(res.data);
    } catch (err) {
      console.error("Round fetch error", err);
    }
  };

  const placeBet = async () => {
    try {
      if (!amount || isNaN(amount)) return Alert.alert("Invalid Amount");
      await axios.post(
        `http://localhost:5000/api/coin/bet`,
        {
          side,
          amount: parseFloat(amount),
          roundId: round?._id,
        },
        {
          headers: { Authorization: "Bearer user-token" },
        }
      );
      Alert.alert("Success", "Bet placed successfully");
      setAmount("");
    } catch (err) {
      console.error("Bet error", err);
      Alert.alert("Error", err.response?.data?.message || "Could not place bet");
    }
  };

  useEffect(() => {
    fetchCurrentRound();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Place Bet for Round #{round?.roundId || "-"}</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.sideButton, side === "Heads" && styles.active]}
          onPress={() => setSide("Heads")}
        >
          <Text style={styles.buttonText}>Heads</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sideButton, side === "Tails" && styles.active]}
          onPress={() => setSide("Tails")}
        >
          <Text style={styles.buttonText}>Tails</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Enter amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity style={styles.betButton} onPress={placeBet}>
        <Text style={styles.buttonText}>Place Bet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  row: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  sideButton: {
    padding: 16,
    backgroundColor: "#ccc",
    borderRadius: 8,
    width: "40%",
    alignItems: "center",
  },
  active: { backgroundColor: "#007bff" },
  buttonText: { color: "white", fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  betButton: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
});
