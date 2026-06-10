import { Stack } from "expo-router";

export default function CoachLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="sub/student" />
      <Stack.Screen name="sub/thread" />
      <Stack.Screen name="sub/announcement" />
      <Stack.Screen name="sub/tasks" />
      <Stack.Screen name="sub/exam" />
    </Stack>
  );
}
