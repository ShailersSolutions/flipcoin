// app/(tabs)/notifications.js
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import api from "../../../utils/api";

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
    
      const res = await api.get("/notifications/user" );
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isFocused) fetchNotifications();
  }, [isFocused]);

 const renderItem = ({ item }) => (
  <TouchableOpacity
    onPress={async () => {
      if (!item.read) {
        try {
         
          await api.put(`/notifications/read/${item._id}`);
          fetchNotifications(); // refresh list
        } catch (e) {
          console.log("Failed to mark as read:", e);
        }
      }
    }}
    activeOpacity={0.8}
  >
    <View style={[styles.card, item.read && styles.readCard]}>
      <Ionicons
        name={item.read ? 'notifications-outline' : 'notifications'}
        size={24}
        color={item.read ? 'gray' : '#007BFF'}
        style={styles.icon}
      />
      <View style={styles.textBox}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </View>
  </TouchableOpacity>
);


  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#007BFF" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#e6f0ff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  readCard: {
    backgroundColor: "#f0f0f0",
  },
  icon: {
    marginRight: 10,
    marginTop: 5,
  },
  textBox: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  body: {
    fontSize: 14,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: "gray",
  },
  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "gray",
    fontSize: 16,
  },
});

export default NotificationsScreen;
