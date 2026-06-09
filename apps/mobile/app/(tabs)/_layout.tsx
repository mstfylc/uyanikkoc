import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MIcon } from "@/components/MIcon";
import { ukColors } from "@/lib/theme";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <MIcon name={name} size={24} color={focused ? ukColors.primary : ukColors.muted} fill={focused && name === "home"} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ukColors.primary,
        tabBarInactiveTintColor: ukColors.muted,
        tabBarStyle: [styles.tabBar, { height: 64 + insets.bottom, paddingBottom: insets.bottom + 8 }],
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: "Odevler",
          tabBarIcon: ({ focused }) => <TabIcon name="clipboard" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="exams"
        options={{
          title: "Denemeler",
          tabBarIcon: ({ focused }) => <TabIcon name="chart" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Program",
          tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    borderTopColor: "#E8E9F2",
    paddingTop: 8,
  },
  tabLabel: { fontSize: 11, fontWeight: "700" },
  iconWrap: { alignItems: "center", justifyContent: "center" },
});
