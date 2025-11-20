

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../utils/api";


const Profile = () => {
   const {  loading ,logout} = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const router = useRouter();
    const shareReferral = async () => {
    try {
      await Share.share({
        message: `Join this fun coin flip game and earn ₹20 using my referral code: ${user.referralCode}`,
      });
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    const getUser = async () => {
      try {
        
        const res = await api.get("/user/profile");
        setUser(res.data.user);
      } catch (e) {
        console.error("Profile fetch failed", e);
      }
    };
    getUser();
  }, []);

  
  if (!user) return <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#007bff" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* User Info Section */}
      <View style={styles.card}>
        <Image
          source={{ uri: user.avatar || `https://i.pravatar.cc/150?u=${user.email}` }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
         <Text>Referral Code: {user.referralCode}</Text>

      <TouchableOpacity style={styles.button} onPress={shareReferral}>
        <Text style={styles.buttonText}>Share Referral</Text>
      </TouchableOpacity>
        <Text style={styles.meta}>Joined: {new Date(user.createdAt).toDateString()}</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push("/edit-profile")}>
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Wallet Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Wallet</Text>
        <Text style={styles.wallet}>₹ {user.wallet}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push("/wallet/topup")}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Top Up Wallet</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statRow}>
          <Stat icon="game-controller-outline" label="Total Bets" value={user.stats?.totalBets || 0} />
          <Stat icon="trophy-outline" label="Wins" value={user.stats?.wins || 0} />
          <Stat icon="close-circle-outline" label="Losses" value={user.stats?.losses || 0} />
        </View>
      </View>

      {/* Navigation Options */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Quick Links</Text>
        <NavLink label="Notifications" icon="notifications-outline" to="/notifications" />
        <NavLink label="Game History" icon="time-outline" to="/history" />
        <NavLink label="Settings" icon="settings-outline" to="/settings" />
        <NavLink label="Wallet Transactions" icon="card-outline" to="/transactions" />
      </View>

      <TouchableOpacity onPress={logout} style={styles.logout}>
        <Ionicons name="log-out-outline" size={18} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const Stat = ({ icon, label, value }) => (
  <View style={styles.statBox}>
    <Ionicons name={icon} size={22} color="#007bff" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const NavLink = ({ icon, label, to }) => {
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.navLink} onPress={() => router.push(to)}>
      <Ionicons name={icon} size={20} color="#333" />
      <Text style={styles.navText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f5f7fa" },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, alignSelf: "center", marginBottom: 10 },
  name: { fontSize: 20, fontWeight: "bold", textAlign: "center" },
  email: { textAlign: "center", color: "#555", marginBottom: 5 },
  meta: { fontSize: 12, textAlign: "center", color: "#aaa" },
  editBtn: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: "center",
  },
  editText: { color: "#fff", marginLeft: 6, fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  wallet: { fontSize: 24, fontWeight: "bold", color: "#28a745", marginBottom: 10 },
  btn: {
    backgroundColor: "#28a745",
    flexDirection: "row",
    justifyContent: "center",
    padding: 10,
    borderRadius: 6,
  },
  btnText: { color: "#fff", marginLeft: 5 },
  statRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  statBox: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 18, fontWeight: "bold", marginTop: 4 },
  statLabel: { fontSize: 12, color: "#555" },
  navLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  navText: { marginLeft: 12, fontSize: 15 },
  logout: {
    marginTop: 30,
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: { color: "#fff", marginLeft: 8, fontWeight: "bold" },
});

export default Profile;
