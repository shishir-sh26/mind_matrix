import { Tabs } from 'expo-router';
import React from 'react';
import { Home, Dumbbell, History, ShieldAlert } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#13ecec',
        tabBarInactiveTintColor: '#64748b',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#091212',
          borderTopWidth: 1,
          borderTopColor: '#ffffff10',
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
          title: 'History',
          tabBarIcon: ({ color }: { color: string }) => <History size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="intervention"
        options={{
          title: 'Emergency',
          tabBarIcon: ({ color }: { color: string }) => <ShieldAlert size={24} color={color === '#13ecec' ? '#ff4d4d' : color} />,
        }}
      />
    </Tabs>
  );
}
