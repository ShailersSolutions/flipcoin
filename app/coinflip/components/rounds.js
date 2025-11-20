// app/(admin)/rounds.js
import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import axios from "axios";

export default function AdminRounds() {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRounds = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/rounds");
      setRounds(res.data);
    } catch (err) {
      console.error("Error fetching rounds", err);
    }
  };

  const retrainModel = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5001/ml/retrain");
      Alert.alert("Model Retrained", res.data.message || "Success");
    } catch (err) {
      console.error("Model retraining failed", err);
      Alert.alert("Failed", "Model training failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flip Round History</Text>

      <TouchableOpacity style={styles.retrainBtn} onPress={retrainModel}>
        <Text style={styles.retrainText}>{loading ? "Training..." : "Retrain ML Model"}</Text>
      </TouchableOpacity>

      <FlatList
        data={rounds}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.roundBox}>
            <Text>Round ID: {item._id}</Text>
            <Text>Winning Side: {item.result}</Text>
            <Text>Total Bets: {item.totalBets}</Text>
            <Text>Timestamp: {new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  retrainBtn: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
  },
  retrainText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  roundBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginBottom: 10,
  },
});
