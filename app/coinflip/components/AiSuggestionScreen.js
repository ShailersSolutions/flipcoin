// frontend/screens/AiSuggestionScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";

const AiSuggestionScreen = ({ userId }) => {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestion = async () => {
      try {
        const res = await axios.get(`/ml/suggestion/${userId}`);
        setSuggestion(res.data);
      } catch (e) {
        console.error("ML Error", e);
        setSuggestion(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestion();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Loading smart suggestion...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🧠 AI Betting Suggestion</Text>
      {suggestion ? (
        <>
          <Text style={styles.label}>Suggested Side: <Text style={styles.side}>{suggestion.recommendation}</Text></Text>
          <Text style={styles.probability}>Confidence: {Math.round(suggestion.probability * 100)}%</Text>
        </>
      ) : (
        <Text style={styles.label}>No data available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 18, marginBottom: 10 },
  side: { fontWeight: "bold", color: "#007BFF" },
  probability: { fontSize: 16, color: "gray" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default AiSuggestionScreen;
