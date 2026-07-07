import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Projects",
          tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="materials"
        options={{
          title: "Materials",
          tabBarIcon: ({ color }) => <Feather name="layers" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Feather name="user" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
