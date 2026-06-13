import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";

import { MIcon } from "@/components/MIcon";
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

  const badges = data?.motivation.badges ?? [];

  return (
    <>
      <Stack.Screen options={{ title: "Motivasyon" }} />
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <MIcon name="flame" size={36} color="#fff" fill />
          <Text style={styles.heroValue}>{data?.motivation.streakDays ?? 0}</Text>
          <Text style={styles.heroLabel}>gün çalışma serisi</Text>
        </View>

        {badges.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Başarımlar</Text>
            {badges.map((badge) => (
              <View key={badge} style={styles.card}>
                <MIcon name="award" size={20} color={ukColors.warning} />
                <Text style={styles.cardTitle}>{badge}</Text>
              </View>
            ))}
          </>
        )}

        {badges.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Henüz rozet kazanılmadı.</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
  content: { padding: ukSpace.lg, paddingBottom: 40 },
  hero: {
    backgroundColor: ukColors.primary,
    borderRadius: ukRadius.lg,
    padding: ukSpace.xl,
    alignItems: "center",
    marginBottom: ukSpace.lg,
  },
  heroValue: { color: "#fff", fontSize: 48, fontWeight: "800", marginTop: 8 },
  heroLabel: { color: "rgba(255,255,255,0.88)", fontWeight: "700" },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: ukColors.text, marginBottom: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    padding: ukSpace.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: ukColors.text },
  emptyWrap: { alignItems: "center", padding: ukSpace.xl },
  emptyText: { color: ukColors.muted, fontWeight: "600" },
});
