// app/wallet/topup.js
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import api from "../../utils/api";
import { router } from "expo-router";

const WalletTopupScreen = () => {
  const [amount, setAmount] = useState("");

  const handleTopUp = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return Alert.alert("Invalid amount");

    try {
      await api.post("/wallet/topup", { amount: num });
      Alert.alert("✅ Top-up successful");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Top-up failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>💸 Add Balance to Wallet</Text>
      <TextInput
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />
      <TouchableOpacity style={styles.btn} onPress={handleTopUp}>
        <Text style={styles.btnText}>Top Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    borderColor: "#ccc",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default WalletTopupScreen;
