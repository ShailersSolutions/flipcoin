// app/(tabs)/WithdrawScreen.js
import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from "react-native";
import axios from "axios";

export default function WithdrawScreen() {
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [transactions, setTransactions] = useState([]);

  const handleWithdraw = async () => {
    if (!amount || !upiId) return Alert.alert("Error", "Fill all fields");

    try {
      await axios.post("http://localhost:5000/api/wallet/withdraw", { amount, upiId }, {
        headers: { Authorization: "Bearer user-token" },
      });
      Alert.alert("Success", "Withdrawal Requested");
      setAmount("");
      setUpiId("");
      fetchTransactions();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Try again");
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/wallet/history", {
        headers: { Authorization: "Bearer user-token" },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetching transactions", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Withdraw to UPI</Text>

      <TextInput
        placeholder="Amount (₹)"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />

      <TextInput
        placeholder="Your UPI ID"
        value={upiId}
        onChangeText={setUpiId}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleWithdraw}>
        <Text style={styles.buttonText}>Submit Request</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Wallet Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.txItem}>
            <Text>{item.type.toUpperCase()} - ₹{item.amount}</Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  txItem: {
    paddingVertical: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
});
