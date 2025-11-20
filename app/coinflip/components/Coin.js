// components/Coin.js
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image } from "react-native";
import { Audio } from "expo-av";

const Coin = ({ side = "Heads", trigger }) => {
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      flipAnim.setValue(0);
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.bezier(0.68, -0.55, 0.27, 1.55),
        useNativeDriver: true,
      }).start();

      playSound();
    }
  }, [trigger]);

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: "https://media.geeksforgeeks.org/wp-content/uploads/20250524122236583887/coin-flip-audio.mp3" },
        { shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (error) {
      console.log("Audio error", error);
    }
  };

  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"],
  });

  return (
    <Animated.Image
      source={{
        uri:
          side === "Heads"
            ? "https://media.geeksforgeeks.org/wp-content/uploads/20250523110516074355/heads.png"
            : "https://media.geeksforgeeks.org/wp-content/uploads/20250523110416893474/tail.png",
      }}
      style={{
        width: 150,
        height: 150,
        alignSelf: "center",
        transform: [{ rotateY }],
      }}
    />
  );
};

export default Coin;
