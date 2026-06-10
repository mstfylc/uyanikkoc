import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/lib/auth";
import { ukColors } from "@/lib/theme";

export default function IndexScreen() {
  const { isLoading, token, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: ukColors.bg }}>
        <ActivityIndicator color={ukColors.primary} />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  if (user?.role === "parent") {
    return <Redirect href="/parent" />;
  }
  if (user?.role === "coach") {
    return <Redirect href="/coach" />;
  }

  return <Redirect href="/(tabs)" />;
}
