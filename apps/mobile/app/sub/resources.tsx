import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";

import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { ukColors, ukRadius, ukSpace } from "@/lib/theme";

export default function ResourcesScreen() {
  const { token } = useAuth();
  const [sources, setSources] = useState<string[]>([]);

  useEffect(() => {
    if (!token) return;
    void apiFetch<{ sources: string[] }>("/api/student/sources", { token })
      .then((res) => setSources(res.sources))
      .catch(() => setSources([]));
  }, [token]);

  return (
    <>
      <Stack.Screen options={{ title: "Kaynaklarim" }} />
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        {sources.length === 0 ? (
          <Text style={styles.empty}>Kaynak bulunamadi.</Text>
        ) : (
          sources.map((source) => (
            <View key={source} style={styles.card}>
              <Text style={styles.cardTitle}>{source}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
  content: { padding: ukSpace.lg, paddingBottom: 40 },
  empty: { color: ukColors.muted, fontWeight: "600" },
  card: {
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    padding: ukSpace.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: ukColors.text },
});
