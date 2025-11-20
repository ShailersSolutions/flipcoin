// app/(admin)/Withdrawals.js
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from "react-native";
import axios from "axios";

export default function WithdrawalsAdmin() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending");

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/withdrawals", {
        headers: { Authorization: "Bearer admin-token" },
      });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecision = async (id, status) => {
    try {
      await axios.post(`http://localhost:5000/api/wallet/withdraw/${id}/decision`, { status }, {
        headers: { Authorization: "Bearer admin-token" },
      });
      Alert.alert("Updated", `Marked as ${status}`);
      fetchRequests();
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);
  

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Withdrawal Requests - {filter}</Text>

      <FlatList
        data={requests.filter((r) => r.status === filter)}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>User: {item.userId.username || item.userId.email}</Text>
            <Text>Amount: ₹{item.amount}</Text>
            <Text>UPI ID: {item.upiId}</Text>
            <Text>Status: {item.status}</Text>

            {filter === "pending" && (
              <View style={styles.btnGroup}>
                <TouchableOpacity style={styles.approve} onPress={() => handleDecision(item._id, "approved")}>
                  <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.reject} onPress={() => handleDecision(item._id, "rejected")}>
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      <View style={styles.tabs}>
        {['pending', 'approved', 'rejected'].map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)}>
            <Text style={[styles.tabText, filter === f && styles.active]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: { backgroundColor: "#f9f9f9", padding: 10, borderRadius: 8, marginBottom: 10 },
  btnGroup: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  approve: { backgroundColor: "green", padding: 10, borderRadius: 6, flex: 1, marginRight: 5 },
  reject: { backgroundColor: "crimson", padding: 10, borderRadius: 6, flex: 1 },
  btnText: { color: "white", fontWeight: "bold", textAlign: "center" },
  tabs: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  tabText: { fontSize: 16 },
  active: { fontWeight: "bold", textDecorationLine: "underline" },
});
