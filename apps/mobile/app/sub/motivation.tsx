import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { ukColors, ukRadius, ukSpace } from "@/lib/theme";

type MotivationPayload = {
  motivation: {
    streakDays: number;
    badges: string[];
  };
};

export default function MotivationScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<MotivationPayload | null>(null);

  useEffect(() => {
    if (!token) return;
    void apiFetch<MotivationPayload>("/api/student/motivation", { token })
      .then(setData)
      .catch(() => setData(null));
  }, [token]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroValue}>{data?.motivation.streakDays ?? 0}</Text>
        <Text style={styles.heroLabel}>gun calisma serisi</Text>
      </View>
      {(data?.motivation.badges ?? []).map((badge) => (
        <View key={badge} style={styles.card}>
          <Text style={styles.cardTitle}>{badge}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
  content: { padding: ukSpace.lg, paddingBottom: 40 },
  hero: {
    backgroundColor: ukColors.primary,
    borderRadius: ukRadius.lg,
    padding: ukSpace.lg,
    alignItems: "center",
    marginBottom: ukSpace.lg,
  },
  heroValue: { color: "#fff", fontSize: 42, fontWeight: "800" },
  heroLabel: { color: "rgba(255,255,255,0.88)", fontWeight: "700" },
  card: {
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    padding: ukSpace.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: ukColors.text },
  cardBody: { marginTop: 8, color: ukColors.muted, lineHeight: 20, fontWeight: "600" },
});
