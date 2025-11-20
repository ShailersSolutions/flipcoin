// components/AnimatedParticipant.js

import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

export default function AnimatedParticipant({ username, side }) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.participant,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <Text style={styles.text}>
        {username} bet on {side === "Heads" ? "🔵 HEADS" : "🔴 TAILS"}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  participant: {
    backgroundColor: "#f2f2f2",
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
});
