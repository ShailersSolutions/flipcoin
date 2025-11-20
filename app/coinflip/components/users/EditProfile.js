import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditProfile = () => {
  const [form, setForm] = useState({ name: "", email: "", avatar: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { name, email, avatar } = res.data.user;
        setForm({ name, email, avatar });
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (key, val) => setForm({ ...form, [key]: val });

  const saveProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.put("/user/update-profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Success", "Profile updated successfully");
      router.replace("/(tabs)/profile");
    } catch (err) {
      console.error("Profile update error", err);
      Alert.alert("Error", "Failed to update profile");
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <Image
        source={{ uri: form.avatar || `https://i.pravatar.cc/150?u=${form.email}` }}
        style={styles.avatar}
      />
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={form.name}
        onChangeText={(val) => handleChange("name", val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        onChangeText={(val) => handleChange("email", val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Avatar URL"
        value={form.avatar}
        onChangeText={(val) => handleChange("avatar", val)}
      />
      {/* Optional password update */}
      {/* <TextInput style={styles.input} secureTextEntry placeholder="New Password" /> */}

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={saveProfile}
        disabled={loading}
      >
        <Ionicons name="save-outline" size={18} color="#fff" />
        <Text style={styles.saveText}>{loading ? "Saving..." : "Save Changes"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f5f7fa", flexGrow: 1 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignSelf: "center",
    marginBottom: 20,
    backgroundColor: "#ddd",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "bold", marginLeft: 8 },
});

export default EditProfile;
