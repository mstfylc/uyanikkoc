import { Stack } from "expo-router";

import { ParentProvider } from "@/lib/parent-context";

export default function ParentLayout() {
  return (
    <ParentProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="sub/messages" />
        <Stack.Screen name="sub/payment" />
        <Stack.Screen name="sub/appointments" />
      </Stack>
    </ParentProvider>
  );
}
