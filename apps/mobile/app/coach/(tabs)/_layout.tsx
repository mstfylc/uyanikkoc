import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";

import { MIcon } from "@/components/MIcon";
import { ukColors } from "@/lib/theme";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <MIcon name={name} size={24} color={focused ? ukColors.primary : ukColors.muted} fill={focused && name === "home"} />
    </View>
  );
}

export default function CoachTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ukColors.primary,
        tabBarInactiveTintColor: ukColors.muted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Bugun", tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} /> }} />
      <Tabs.Screen name="students" options={{ title: "Ogrenciler", tabBarIcon: ({ focused }) => <TabIcon name="users" focused={focused} /> }} />
      <Tabs.Screen name="messages" options={{ title: "Mesajlar", tabBarIcon: ({ focused }) => <TabIcon name="message" focused={focused} /> }} />
      <Tabs.Screen name="program" options={{ title: "Program", tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profil", tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: "#fff", borderTopColor: "#E8E9F2", height: 72, paddingTop: 8 },
  tabLabel: { fontSize: 11, fontWeight: "700" },
  iconWrap: { alignItems: "center", justifyContent: "center" },
});
