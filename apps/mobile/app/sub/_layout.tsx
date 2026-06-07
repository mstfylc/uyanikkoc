import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { MIcon } from "@/components/MIcon";
import { ukColors } from "@/lib/theme";

export default function SubLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: ukColors.bg },
        headerTitleStyle: { fontWeight: "800", color: ukColors.text },
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={styles.back}>
            <MIcon name="chevronLeft" size={22} color={ukColors.text} />
          </Pressable>
        ),
      }}
    />
  );
}

const styles = StyleSheet.create({
  back: { paddingHorizontal: 8, paddingVertical: 4 },
});
