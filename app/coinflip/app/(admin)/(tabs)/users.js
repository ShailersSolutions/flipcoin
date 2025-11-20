// screens/admin/AdminRechargeScreen.js

import api from "@/utils/api";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminRechargeScreen() {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingRecharges = async () => {
    try {
      const res = await api.get("/recharge/allUsers/pending");
      setRecharges(res.data);
    } catch (err) {
      console.error("Failed to fetch recharges", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.post(`/recharge/${id}/${action}`);
      Alert.alert(`Recharge ${action}ed successfully`);
      fetchPendingRecharges(); // refresh list
    } catch (err) {
      console.error(`${action} failed`, err);
      Alert.alert(`Failed to ${action} recharge`);
    }
  };

  useEffect(() => {
    fetchPendingRecharges();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pending Recharge Requests</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#333" />
      ) : recharges.length === 0 ? (
        <Text style={styles.noRequests}>No pending requests</Text>
      ) : (
        recharges.map((r) => (
         <View key={r._id} style={styles.card}>
  <Text>User: {r.userId.email}</Text>
  <Text>Amount: ₹{r.amount}</Text>
  <Text>Status: {r.status}</Text>
  <View style={styles.buttonRow}>
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: "green" }]}
      onPress={() => handleAction(r._id, "approve")}
    >
      <Text style={styles.btnText}>Approve</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: "red" }]}
      onPress={() => handleAction(r._id, "reject")}
    >
      <Text style={styles.btnText}>Reject</Text>
    </TouchableOpacity>
  </View>
</View>

        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  noRequests: {
    textAlign: "center",
    color: "#777",
    marginTop: 30,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
