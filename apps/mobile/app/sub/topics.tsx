import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";

import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { subjectColor, ukColors, ukRadius, ukSpace } from "@/lib/theme";

type Subject = {
  id: string;
  name: string;
  examType: string;
  topicsDone?: number;
  topicsTotal?: number;
};

export default function TopicsScreen() {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    void apiFetch<{ subjects: Subject[] }>("/api/student/topics", { token })
      .then((res) => {
        setSubjects(res.subjects);
        if (res.subjects.length > 0) setActiveSubject(res.subjects[0].id);
      })
      .catch(() => setSubjects([]));
  }, [token]);

  const active = subjects.find((s) => s.id === activeSubject);

  return (
    <>
      <Stack.Screen options={{ title: "Konu Takibi" }} />
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        {/* Ders sekmeleri */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {subjects.map((s) => (
            <Pressable
              key={s.id}
              style={[styles.tab, activeSubject === s.id && { backgroundColor: subjectColor(s.name), borderColor: subjectColor(s.name) }]}
              onPress={() => setActiveSubject(s.id)}
            >
              <Text style={[styles.tabText, activeSubject === s.id && styles.tabTextActive]}>
                {s.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {active && (
          <>
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>{active.name}</Text>
              <Text style={styles.progressSub}>{active.examType}</Text>
              {active.topicsTotal ? (
                <>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.round(((active.topicsDone ?? 0) / active.topicsTotal) * 100)}%`,
                          backgroundColor: subjectColor(active.name),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressLabel}>
                    {active.topicsDone ?? 0} / {active.topicsTotal} konu tamamlandı
                  </Text>
                </>
              ) : null}
            </View>

            {/* Işı haritası (basit kart grid) */}
            <Text style={styles.sectionTitle}>Konu ilerleme haritası</Text>
            <View style={styles.heatGrid}>
              {Array.from({ length: 20 }, (_, i) => {
                const done = i < (active.topicsDone ?? 0);
                return (
                  <View
                    key={i}
                    style={[
                      styles.heatCell,
                      { backgroundColor: done ? subjectColor(active.name) : ukColors.border },
                    ]}
                  />
                );
              })}
            </View>
          </>
        )}

        {subjects.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Konu verisi bulunamadı.</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
  content: { padding: ukSpace.lg, paddingBottom: 40 },
  tabRow: { flexDirection: "row", gap: 8, paddingBottom: ukSpace.md },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: ukRadius.md,
    backgroundColor: ukColors.surface,
    borderWidth: 1,
    borderColor: ukColors.border,
  },
  tabText: { fontSize: 13, fontWeight: "700", color: ukColors.muted },
  tabTextActive: { color: "#fff" },
  progressCard: {
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.lg,
    padding: ukSpace.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    marginBottom: ukSpace.lg,
  },
  progressTitle: { fontSize: 17, fontWeight: "800", color: ukColors.text },
  progressSub: { color: ukColors.muted, fontWeight: "600", marginBottom: 12 },
  progressBar: { height: 10, borderRadius: 5, backgroundColor: ukColors.bg, overflow: "hidden" },
  progressFill: { height: 10, borderRadius: 5 },
  progressLabel: { marginTop: 8, fontSize: 12, fontWeight: "700", color: ukColors.muted },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: ukColors.text, marginBottom: 12 },
  heatGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  heatCell: { width: 28, height: 28, borderRadius: 6 },
  emptyWrap: { alignItems: "center", padding: ukSpace.xl },
  emptyText: { color: ukColors.muted, fontWeight: "600" },
});
