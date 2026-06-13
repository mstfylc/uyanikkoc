import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { ukColors, ukRadius, ukSpace } from "@/lib/theme";

type Exam = {
  id: string;
  label: string | null;
  takenAt: string;
  totalNet: number;
  examType: string;
};

const TABS = ["Sonuçlar", "Analiz", "Online Deneme"] as const;
type TabType = (typeof TABS)[number];

export default function ExamsTab() {
  const { token } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("Sonuçlar");

  useEffect(() => {
    if (!token) return;
    void apiFetch<{ exams: Exam[] }>("/api/student/exams", { token })
      .then((res) => setExams(res.exams))
      .catch(() => setExams([]));
  }, [token]);

  const maxNet = exams.length > 0 ? Math.max(...exams.map((e) => e.totalNet)) : 0;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Denemeler</Text>

      {/* Sekme segmenti */}
      <View style={styles.seg}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.segItem, activeTab === tab && styles.segItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.segText, activeTab === tab && styles.segTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      {/* Net Kaybı Haritası kartı (tüm sekmelerde üstte) */}
      {exams.length > 0 && (
        <View style={styles.mapCard}>
          <View style={styles.mapCardHead}>
            <View>
              <Text style={styles.mapCardTitle}>Net Kaybı Haritası</Text>
              <Text style={styles.mapCardSub}>En yüksek kayıp alanları</Text>
            </View>
            <Pressable style={styles.mapCta}>
              <Text style={styles.mapCtaText}>Programa ekle</Text>
            </Pressable>
          </View>
          <View style={styles.mapBars}>
            {exams.slice(0, 5).map((exam) => {
              const w = maxNet > 0 ? (exam.totalNet / maxNet) * 100 : 0;
              return (
                <View key={exam.id} style={styles.mapBarRow}>
                  <Text style={styles.mapBarLabel} numberOfLines={1}>
                    {exam.label ?? exam.examType}
                  </Text>
                  <View style={styles.mapBarTrack}>
                    <View style={[styles.mapBarFill, { width: `${w}%` }]} />
                  </View>
                  <Text style={styles.mapBarNet}>{exam.totalNet.toFixed(1)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {activeTab === "Sonuçlar" && (
        <>
          <Text style={styles.groupLabel}>{exams.length} sonuç</Text>
          {exams.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Henüz deneme sonucu yok.</Text>
            </View>
          ) : (
            exams.map((exam) => (
              <View key={exam.id} style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{exam.label ?? "Deneme"}</Text>
                  <Text style={styles.cardMeta}>
                    {exam.examType} · {exam.takenAt}
                  </Text>
                </View>
                <Text style={styles.net}>{exam.totalNet.toFixed(1)}</Text>
              </View>
            ))
          )}
        </>
      )}

      {activeTab === "Analiz" && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Analiz içeriği yakında.</Text>
        </View>
      )}

      {activeTab === "Online Deneme" && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Online deneme yakında.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
  content: { padding: ukSpace.lg, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "800", color: ukColors.text, marginBottom: ukSpace.md },
  seg: {
    flexDirection: "row",
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    padding: 4,
    marginBottom: ukSpace.md,
  },
  segItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: ukRadius.sm,
  },
  segItemActive: { backgroundColor: ukColors.primary },
  segText: { fontSize: 11, fontWeight: "700", color: ukColors.muted },
  segTextActive: { color: "#fff" },
  mapCard: {
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.lg,
    padding: ukSpace.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    marginBottom: ukSpace.lg,
  },
  mapCardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  mapCardTitle: { fontSize: 15, fontWeight: "800", color: ukColors.text },
  mapCardSub: { color: ukColors.muted, fontSize: 12, fontWeight: "600" },
  mapCta: {
    backgroundColor: ukColors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mapCtaText: { color: ukColors.primary600, fontSize: 12, fontWeight: "800" },
  mapBars: { gap: 10 },
  mapBarRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  mapBarLabel: { width: 70, fontSize: 11, fontWeight: "700", color: ukColors.muted },
  mapBarTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: ukColors.bg },
  mapBarFill: { height: 8, borderRadius: 4, backgroundColor: ukColors.primary },
  mapBarNet: { width: 32, fontSize: 12, fontWeight: "800", color: ukColors.primary, textAlign: "right" },
  groupLabel: { fontSize: 13, fontWeight: "800", color: ukColors.muted, marginBottom: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    padding: ukSpace.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: ukColors.text },
  cardMeta: { marginTop: 4, fontSize: 12, fontWeight: "600", color: ukColors.muted },
  net: { fontSize: 22, fontWeight: "800", color: ukColors.primary },
  emptyWrap: { alignItems: "center", padding: ukSpace.xl },
  emptyText: { color: ukColors.muted, fontWeight: "600" },
});
