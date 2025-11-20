
// app/(admin)/dashboard.js
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ScrollView } from "react-native";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/analytics");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <Text>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text>Total Users: {stats.totalUsers}</Text>
      <Text>Total Bets: {stats.totalBets}</Text>
      <Text>Total Amount Bet: ₹{stats.totalAmountBet}</Text>
      <Text>Wins: {stats.winLossDistribution.wins}</Text>
      <Text>Losses: {stats.winLossDistribution.losses}</Text>

      <Text style={styles.subtitle}>Top Active Players</Text>
      <FlatList
        data={stats.topPlayers}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <View style={styles.playerItem}>
            <Text>#{index + 1} User: {item._id}</Text>
            <Text>Bets: {item.bets}</Text>
            <Text>Total: ₹{item.totalBet}</Text>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { marginTop: 20, fontSize: 18, fontWeight: "bold" },
  playerItem: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
  },
});

// app/(admin)/Analytics.js
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, PieChart } from "react-native-chart-kit";

export default function AnalyticsScreen() {
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/analytics", {
        headers: { Authorization: "Bearer admin-token" },
      });
      setStats(res.data);
    } catch (err) {
      alert("Failed to fetch stats");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (!stats) return <Text style={{ margin: 30 }}>Loading charts...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Flip Trends & Stats</Text>

      <Text style={styles.subtitle}>Weekly Wins</Text>
      <BarChart
        data={{
          labels: stats.week.labels,
          datasets: [{ data: stats.week.wins }],
        }}
        width={Dimensions.get("window").width - 20}
        height={220}
        fromZero
        yAxisLabel="₹"
        chartConfig={chartConfig}
        style={styles.chart}
      />

      <Text style={styles.subtitle}>Side Win Ratio</Text>
      <PieChart
        data={stats.ratio.map((r, i) => ({
          name: r.label,
          population: r.value,
          color: i % 2 === 0 ? "#007bff" : "#ffc107",
          legendFontColor: "#333",
          legendFontSize: 14,
        }))}
        width={Dimensions.get("window").width - 20}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
      />
    </ScrollView>
  );
}

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 15 },
  subtitle: { fontSize: 16, marginTop: 20, fontWeight: "600" },
  chart: { borderRadius: 10 },
});
