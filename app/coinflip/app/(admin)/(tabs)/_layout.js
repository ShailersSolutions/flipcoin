import { tabIconMap } from '@/constants/adminTabIconMap';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AdminLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
        tabBarIcon: ({ color, size = 24 }) =>
          tabIconMap[route.name]?.(color, size) ?? null,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notify' }} />
      <Tabs.Screen name="admin-profile" options={{ title: 'More' }} />
      <Tabs.Screen name="users" options={{ title: 'Users' }} />
    </Tabs>
  );
}
