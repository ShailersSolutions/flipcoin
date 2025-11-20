import { useColorScheme } from "@/hooks/useColorScheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { AuthContext, AuthProvider } from "../context/AuthContext";
import { GameProvider } from "../context/GameContext"; 
import { SoundProvider } from '../context/SoundContext';


function LayoutWrapper() {
  const { userToken, loading, setUserRole, userRole} = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(true);
  console.log("userToken:", userToken);
console.log("userRole:", userRole);
console.log("loading:", loading);
console.log("segments:", segments);

useEffect(() => {
  console.log("Running redirect logic...");

  if (!loading && userToken && userRole) {
    const inAuthGroup = segments[0] === "auth";
    console.log("Inside auth group:", inAuthGroup);

    if (inAuthGroup) {
      if (userRole === "admin") {
        console.log("Redirecting to admin...");
        router.replace("/(admin)/(tabs)");
      } else {
        console.log("Redirecting to player...");
        router.replace("/(players)/(tabs)");
      }
    }

    setRedirecting(false);
  }

  
  else if (!loading && !userToken && segments[0] !== "auth") {
    console.log("No token, redirecting to login...");
    router.replace("/auth/login");
    setRedirecting(false);
  }

  
  else if (!loading && !userToken && segments[0] === "auth") {
    console.log("Already in auth group. Letting screen load.");
    setRedirecting(false);
  }
}, [userToken, loading, userRole]);

if (loading || redirecting) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Loading...</Text>
    </View>
  );
}

  return (
    <Stack>
     
      <Stack.Screen name="auth/login" options={{ title: "Login" }} />
      <Stack.Screen name="auth/register" options={{ title: "Register" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) return null;

  return (
    
    <AuthProvider>
      <GameProvider>
        <SoundProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <LayoutWrapper />
          <StatusBar style="auto" />
        </ThemeProvider>
        </SoundProvider>
      </GameProvider>
    </AuthProvider>
  );
}


