// app/admin/refunds.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import axios from "axios";

const RefundManagerScreen = () => {
  const [refunds, setRefunds] = useState([]);

  useEffect(() => {
    const fetchRefundRequests = async () => {
      try {
        const res = await axios.get("/admin/refunds/pending");
        setRefunds(res.data);
      } catch (err) {
        console.error("Refund fetch error", err);
      }
    };
    fetchRefundRequests();
  }, []);

  const handleDecision = async (id, approve) => {
    try {
      await axios.post(`/admin/refunds/${id}/${approve ? "approve" : "reject"}`);
      Alert.alert("Success", `Request ${approve ? "approved" : "rejected"}`);
      setRefunds((prev) => prev.filter((r) => r._id !== id));
    } catch (e) {
      console.error("Decision error", e);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text>User: {item.user.username}</Text>
      <Text>Reason: {item.reason}</Text>
      <Text>Amount: ₹{item.amount}</Text>
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "green" }]}
          onPress={() => handleDecision(item._id, true)}
        >
          <Text style={styles.btnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "red" }]}
          onPress={() => handleDecision(item._id, false)}
        >
          <Text style={styles.btnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🧾 Refund Requests</Text>
      <FlatList data={refunds} keyExtractor={(item) => item._id} renderItem={renderItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  btn: {
    padding: 10,
    borderRadius: 6,
  },
  btnText: { color: "white", fontWeight: "bold" },
});

export default RefundManagerScreen;
