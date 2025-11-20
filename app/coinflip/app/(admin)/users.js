import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import axios from "axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error loading users", err);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      Alert.alert("Deleted", "User removed");
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Registered Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.userBox}>
            <Text>{item.username}</Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteUser(item._id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  userBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  deleteBtn: {
    backgroundColor: "#ff4d4d",
    padding: 5,
    borderRadius: 4,
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
  },
});
