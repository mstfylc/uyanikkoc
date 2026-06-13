import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { ukColors, ukRadius, ukSpace } from "@/lib/theme";

const STATUS_LABELS: Record<string, string> = {
  active: "Aktif",
  done: "Tamamlandı",
  pending: "Beklemede",
};

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
      <Stack.Screen options={{ title: "Kaynaklarım" }} />
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        {sources.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MIcon name="book" size={32} color={ukColors.faint} />
            <Text style={styles.empty}>Kayıt bulunamadı.</Text>
          </View>
        ) : (
          sources.map((source) => (
            <View key={source} style={styles.card}>
              <MIcon name="book" size={18} color={ukColors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{source}</Text>
                <Text style={styles.cardMeta}>{STATUS_LABELS["active"]}</Text>
              </View>
            </View>
          ))
        )}
        <Pressable style={styles.addBtn}>
          <MIcon name="plus" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Kaynak Ekle</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
  content: { padding: ukSpace.lg, paddingBottom: 40 },
  emptyWrap: { alignItems: "center", gap: 10, padding: ukSpace.xl },
  empty: { color: ukColors.muted, fontWeight: "600" },
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
  cardMeta: { marginTop: 4, fontSize: 12, fontWeight: "600", color: ukColors.success },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: ukColors.primary,
    borderRadius: ukRadius.md,
    minHeight: 48,
    marginTop: ukSpace.lg,
  },
  addBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
