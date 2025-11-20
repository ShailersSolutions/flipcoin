// app/(tabs)/settings.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const SettingsScreen = () => {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          router.replace("/auth/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>App Version</Text>
        <Text style={styles.value}>{Constants.expoConfig.version}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f7f7f7",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    elevation: 1,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#ff4d4d",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SettingsScreen;
