import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import api from "../../../utils/api";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
     
        const res = await api.get("/admin/profile");
        setAdmin(res.data.admin);
      } catch (err) {
        console.log("Admin profile load failed", err);
      }
    };

    fetchAdmin();
  }, []);

  if (!admin) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: admin.avatar || "https://i.pravatar.cc/300?img=admin" }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{admin.name}</Text>
        <Text style={styles.email}>{admin.email}</Text>
        <Text style={styles.role}>Role: {admin.role || "Administrator"}</Text>
      </View>

      <View style={styles.menuContainer}>
        <MenuButton icon="stats-chart" label="User Stats" path="/(admin)/stats" />
        <MenuButton icon="time" label="Flip History" path="/(admin)/flip-history" />
        <MenuButton icon="people" label="Active Game Rooms" path="/(admin)/active-rooms" />
        <MenuButton icon="wallet" label="Wallet Logs" path="/(admin)/wallet-logs" />
        <MenuButton icon="notifications" label="Notifications" path="/(admin)/admin-notifications" />
      </View>
    </ScrollView>
  );
};

const MenuButton = ({ icon, label, path }) => {
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.menuButton} onPress={() => router.push(path)}>
      <Ionicons name={icon} size={24} color="#007BFF" />
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f2f2" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileHeader: { alignItems: "center", marginBottom: 30 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  name: { fontSize: 20, fontWeight: "bold" },
  email: { fontSize: 16, color: "#555" },
  role: { fontSize: 14, color: "#888" },

  menuContainer: { marginTop: 20 },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  menuLabel: {
    marginLeft: 14,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});

export default AdminProfile;
