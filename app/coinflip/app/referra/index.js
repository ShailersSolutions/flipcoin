// app/referral/index.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import axios from "axios";

const ReferralSummaryScreen = ({ userId }) => {
  const [referrals, setReferrals] = useState([]);
  const [bonusTotal, setBonusTotal] = useState(0);

  useEffect(() => {
    const fetchReferrals = async () => {
      const res = await axios.get(`/referral/summary/${userId}`);
      setReferrals(res.data.referrals);
      setBonusTotal(res.data.totalBonus);
    };
    fetchReferrals();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name || item.referredUser?.username || "Friend"}</Text>
      <Text style={styles.detail}>Joined: {new Date(item.createdAt).toLocaleDateString()}</Text>
      <Text style={styles.bonus}>Bonus: ₹{item.bonus}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🤝 Referral Summary</Text>
      <Text style={styles.total}>Total Bonus Earned: ₹{bonusTotal}</Text>
      <FlatList
        data={referrals}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  total: { fontSize: 18, marginBottom: 20, color: "green" },
  card: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  name: { fontSize: 16, fontWeight: "bold" },
  detail: { fontSize: 14, color: "#666" },
  bonus: { fontSize: 16, fontWeight: "600", marginTop: 5, color: "#007BFF" },
});

export default ReferralSummaryScreen;
