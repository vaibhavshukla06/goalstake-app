import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ label, color }: { label: string; color: string }) {
  const icons: Record<string, string> = {
    'Home': '🏠',
    'Challenges': '🎯',
    'Create': '➕',
    'Social': '👥',
    'Leaderboard': '🏆',
    'Profile': '👤',
  };
  
  return <Text style={{ fontSize: 20, color }}>{icons[label] || '📱'}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#5E72EB',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabIcon label="Home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: "Challenges",
          tabBarIcon: ({ color }) => <TabIcon label="Challenges" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color }) => <TabIcon label="Create" color={color} />,
        }}
      />
      <Tabs.Screen
        name="social-feed"
        options={{
          title: "Social",
          tabBarIcon: ({ color }) => <TabIcon label="Social" color={color} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color }) => <TabIcon label="Leaderboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabIcon label="Profile" color={color} />,
        }}
      />
    </Tabs>
  );
}