import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import axios from "axios";

export default function MLScoreboard() {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await axios.get("http://localhost:5001/ml/predictions");
        setPredictions(res.data);
      } catch (err) {
        console.error("Error fetching predictions", err);
      }
    };
    fetchPredictions();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ML Prediction Scoreboard</Text>
      <FlatList
        data={predictions}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.predBox}>
            <Text>Suggested Side: {item.side}</Text>
            <Text>Confidence: {(item.confidence * 100).toFixed(2)}%</Text>
            <Text>Risk Score: {item.riskScore}</Text>
            <Text>Round ID: {item.roundId}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  predBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginBottom: 10,
  },
});
