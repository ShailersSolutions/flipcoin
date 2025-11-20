import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
        tabBarIcon: ({ color, size = 26 }) => {
          const iconMap: Record<string, keyof typeof import('@/components/ui/IconSymbol').defaultProps['name']> = {
            index: 'house.fill',
            wallet: 'creditcard.fill',
            profile: 'person.crop.circle.fill',
            notifications: 'bell.fill',
            leaderboard: 'chart.bar.fill',
            'game-room': 'gamecontroller.fill',
          };

          const iconName = iconMap[route.name];
          return iconName ? (
            <IconSymbol name={iconName} size={size} color={color} />
          ) : null;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="wallet" options={{ title: 'Wallet' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Tabs.Screen name="leaderboard" options={{ title: 'Leaderboard' }} />
      {/* <Tabs.Screen name="game-room" options={{ title: 'Game' }} /> */}
    </Tabs>
  );
}
