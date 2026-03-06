import { Tabs } from 'expo-router';
import React from 'react';
import { Home, Dumbbell, History, ShieldAlert } from 'lucide-react-native';
import { useAppTheme } from '../theme-context';

export default function TabLayout() {
  const { isLightMode } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isLightMode ? '#0284c7' : '#13ecec',
        tabBarInactiveTintColor: isLightMode ? '#94a3b8' : '#64748b',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isLightMode ? '#ffffff' : '#091212',
          borderTopWidth: 1,
          borderTopColor: isLightMode ? '#e2e8f0' : '#ffffff10',
          height: 90,
          paddingBottom: 30,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }: { color: string }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color }: { color: string }) => <Dumbbell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }: { color: string }) => <History size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="intervention"
        options={{
          title: 'Emergency',
          tabBarIcon: ({ color }: { color: string }) => {
            const isActive = color === (isLightMode ? '#0284c7' : '#13ecec');
            return <ShieldAlert size={24} color={isActive ? '#ff4d4d' : color} />;
          },
        }}
      />
    </Tabs>
  );
}
