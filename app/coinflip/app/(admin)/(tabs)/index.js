import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { VictoryBar, VictoryChart, VictoryTheme } from "victory-native";
import api from "../../../utils/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get("http://localhost:5000/api/admin/dashboard-stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching admin stats", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007bff" />;

  if (!stats) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>No dashboard data available.</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get("window").width - 40;

  const barData = {
    labels: ["Bets", "Wins", "Losses"],
    datasets: [{
      data: [
        stats?.totalBet ?? 0,
        stats?.totalWin ?? 0,
        stats?.totalLoss ?? 0,
      ],
    }],
  };

  const pieData = [
    {
      name: "Platform Profit",
      amount: stats?.platformProfit ?? 0,
      color: "#28a745",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "User Wins",
      amount: stats?.totalWin ?? 0,
      color: "#007bff",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "User Losses",
      amount: stats?.totalLoss ?? 0,
      color: "#dc3545",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchStats();
          }}
        />
      }
    >
      <Text style={styles.heading}>Admin Dashboard</Text>

      <View style={styles.card}><Text>Total Users: {stats?.totalUsers ?? "N/A"}</Text></View>
      <View style={styles.card}><Text>Active Players (24h): {stats?.activePlayers ?? "N/A"}</Text></View>
      <View style={styles.card}><Text>Total Coin Flips: {stats?.totalFlips ?? "N/A"}</Text></View>
      <View style={styles.card}><Text>Total Bet Amount: ₹{stats?.totalBet ?? 0}</Text></View>
      <View style={styles.card}><Text>Total Wins Paid: ₹{stats?.totalWin ?? 0}</Text></View>
      <View style={styles.card}><Text>Total Losses: ₹{stats?.totalLoss ?? 0}</Text></View>
      <View style={styles.card}>
        <Text>Platform Profit (5%): ₹{stats?.platformProfit?.toFixed(2) ?? "0.00"}</Text>
      </View>

      <Text style={styles.label}>Games Played: {stats?.totalGames ?? "N/A"}</Text>
      <Text style={styles.label}>Total Revenue: ₹{stats?.revenue ?? 0}</Text>

      <Text style={[styles.heading, { fontSize: 20 }]}>Analytics Charts</Text>

      <Text style={styles.subheading}>📈 Weekly Bet Trends</Text>
      {stats?.weeklyBets?.length > 0 && (
        <VictoryChart theme={VictoryTheme.material} domainPadding={10}>
          <VictoryBar
            data={stats.weeklyBets}
            x="day"
            y="count"
            style={{ data: { fill: "#007BFF" } }}
          />
        </VictoryChart>
      )}

      <BarChart
        data={barData}
        width={screenWidth}
        height={220}
        fromZero
        chartConfig={chartConfig}
        style={{ marginVertical: 10, borderRadius: 12 }}
      />

      <PieChart
        data={pieData}
        width={screenWidth}
        height={220}
        accessor="amount"
        chartConfig={chartConfig}
        backgroundColor="transparent"
        paddingLeft="10"
        style={{ marginVertical: 10 }}
      />
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
  labelColor: () => "#333",
  barPercentage: 0.7,
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subheading: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  card: {
    backgroundColor: "#f4f4f4",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: "500",
  },
  infoText: {
    fontSize: 16,
    color: "gray",
  },
});
