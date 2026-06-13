import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { subjectColor, ukColors, ukRadius, ukSpace } from "@/lib/theme";

type Assignment = {
  id: string;
  title: string;
  status: string;
  completed: boolean;
  subject: string | null;
  dueDate: string | null;
};

type Exam = {
  id: string;
  label: string | null;
  takenAt: string;
  totalNet: number;
  examType: string;
};

type ResultState = {
  correct: string;
  wrong: string;
  empty: string;
};

function computeNet(correct: string, wrong: string): string {
  const d = parseFloat(correct) || 0;
  const y = parseFloat(wrong) || 0;
  return Math.max(0, d - y / 4).toFixed(2);
}

export default function HomeTab() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [resultSheet, setResultSheet] = useState<{ item: Assignment; data: ResultState } | null>(null);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        const [assignmentsRes, examsRes] = await Promise.all([
          apiFetch<{ assignments: Assignment[] }>("/api/student/assignments", { token }),
          apiFetch<{ exams: Exam[] }>("/api/student/exams", { token }),
        ]);
        setAssignments(assignmentsRes.assignments);
        setExams(examsRes.exams.slice(0, 1));
      } catch {
        // boş durum
      }
    })();
  }, [token]);

  const pending = useMemo(() => assignments.filter((item) => !item.completed), [assignments]);
  const doneCount = assignments.length - pending.length;
  const pct = assignments.length > 0 ? Math.round((doneCount / assignments.length) * 100) : 0;
  const latestNet = exams[0]?.totalNet ?? 0;

  const firstName = (() => {
    const raw = user?.email.split("@")[0] ?? "Öğrenci";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  })();

  function openResult(item: Assignment) {
    setResultSheet({ item, data: { correct: "", wrong: "", empty: "" } });
  }

  function closeResult() {
    setResultSheet(null);
  }

  function updateResult(field: keyof ResultState, val: string) {
    if (!resultSheet) return;
    const next = { ...resultSheet.data, [field]: val };
    setResultSheet({ ...resultSheet, data: next });
  }

  async function saveResult() {
    if (!resultSheet || !token) return;
    try {
      await apiFetch(`/api/student/assignments/${resultSheet.item.id}/result`, {
        token,
        method: "PATCH",
        body: JSON.stringify({
          correct: parseInt(resultSheet.data.correct) || 0,
          wrong: parseInt(resultSheet.data.wrong) || 0,
          empty: parseInt(resultSheet.data.empty) || 0,
        }),
      });
      setAssignments((prev) =>
        prev.map((a) => (a.id === resultSheet.item.id ? { ...a, completed: true } : a))
      );
    } catch {
      // sessiz hata
    } finally {
      closeResult();
    }
  }

  const net = resultSheet
    ? computeNet(resultSheet.data.correct, resultSheet.data.wrong)
    : "0.00";

  return (
    <>
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        {/* Selam başlığı */}
        <View style={styles.head}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.hi}>İyi çalışmalar,</Text>
            <Text style={styles.name}>{firstName}</Text>
          </View>
          <Pressable style={styles.iconBtn}>
            <MIcon name="bell" size={20} color={ukColors.text} />
          </Pressable>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.badge}>
              <MIcon name="flame" size={13} color="#fff" fill />
              <Text style={styles.badgeText}>12 gün serisi</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>
            {pending.length > 0 ? `Bugün ${pending.length} ödevin var` : "Bugünün ödevleri tamam!"}
          </Text>
          <Text style={styles.heroSub}>
            {doneCount} tamamlandı · {pending.length} bekliyor
          </Text>
          <View style={styles.heroBar}>
            <View style={[styles.heroBarFill, { width: `${pct}%` }]} />
          </View>
          <Pressable style={styles.heroCta} onPress={() => router.push("/(tabs)/assignments")}>
            <Text style={styles.heroCtaText}>Ödevlere git</Text>
            <MIcon name="chevronRight" size={16} color="#fff" />
          </Pressable>
        </View>

        {/* 2×2 stat kartları */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderTopColor: ukColors.primary, borderTopWidth: 3 }]}>
            <MIcon name="chart" size={16} color={ukColors.primary} />
            <Text style={styles.statLabel}>Son net</Text>
            <Text style={[styles.statValue, { color: ukColors.primary }]}>{latestNet.toFixed(1)}</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: ukColors.success, borderTopWidth: 3 }]}>
            <MIcon name="clock" size={16} color={ukColors.success} />
            <Text style={styles.statLabel}>Bu hafta</Text>
            <Text style={[styles.statValue, { color: ukColors.success }]}>23.5 sa</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: ukColors.warning, borderTopWidth: 3 }]}>
            <MIcon name="check" size={16} color={ukColors.warning} />
            <Text style={styles.statLabel}>Tamamlama</Text>
            <Text style={[styles.statValue, { color: ukColors.warning }]}>{pct}%</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: ukColors.info, borderTopWidth: 3 }]}>
            <MIcon name="flame" size={16} color={ukColors.info} fill />
            <Text style={styles.statLabel}>Seri</Text>
            <Text style={[styles.statValue, { color: ukColors.info }]}>12 gün</Text>
          </View>
        </View>

        {/* Bugünün ödevleri */}
        <Section
          title="Bugünün ödevleri"
          action="Tümü"
          onAction={() => router.push("/(tabs)/assignments")}
        >
          {pending.length === 0 ? (
            <View style={styles.empty}>
              <MIcon name="check" size={22} color={ukColors.success} />
              <Text style={styles.emptyText}>Tüm ödevler tamamlandı!</Text>
            </View>
          ) : (
            pending.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={[styles.dot, { backgroundColor: subjectColor(item.subject ?? "Matematik") }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardMeta}>
                    {item.subject ?? "Genel"} · {item.dueDate ?? "Tarih yok"}
                  </Text>
                </View>
                <Pressable style={styles.resultBtn} onPress={() => openResult(item)}>
                  <Text style={styles.resultBtnText}>Sonuç Gir</Text>
                </Pressable>
              </View>
            ))
          )}
        </Section>

        {/* Hızlı erişim */}
        <Section title="Hızlı erişim">
          <View style={styles.quickGrid}>
            {(
              [
                ["topics", "book", "Konu Takibi"],
                ["resources", "notebook", "Kaynaklarım"],
                ["appointments", "calendar", "Randevular"],
                ["messages", "message", "Mesajlar"],
                ["motivation", "heart", "Motivasyon"],
                ["destek", "help", "Destek"],
              ] as [string, string, string][]
            ).map(([route, icon, label]) => (
              <Pressable
                key={route}
                style={styles.quickItem}
                onPress={() => router.push(`/sub/${route}` as never)}
              >
                <View style={styles.quickIcon}>
                  <MIcon name={icon} size={21} color={ukColors.primary} fill={icon === "heart"} />
                </View>
                <Text style={styles.quickLabel}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </Section>
      </ScrollView>

      {/* ResultSheet (bottom-sheet emülasyonu) */}
      <Modal
        visible={!!resultSheet}
        transparent
        animationType="slide"
        onRequestClose={closeResult}
      >
        <Pressable style={styles.overlay} onPress={closeResult} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{resultSheet?.item.title ?? ""}</Text>
          <Text style={styles.sheetSub}>{resultSheet?.item.subject ?? "Genel"}</Text>

          <View style={styles.sheetRow}>
            {(
              [
                ["correct", "Doğru", ukColors.success],
                ["wrong", "Yanlış", ukColors.danger],
                ["empty", "Boş", ukColors.muted],
              ] as [keyof ResultState, string, string][]
            ).map(([field, label, color]) => (
              <View key={field} style={styles.sheetField}>
                <Text style={[styles.sheetFieldLabel, { color }]}>{label}</Text>
                <TextInput
                  style={[styles.sheetInput, { borderColor: color }]}
                  keyboardType="number-pad"
                  value={resultSheet?.data[field] ?? ""}
                  onChangeText={(v) => updateResult(field, v)}
                  placeholder="0"
                  placeholderTextColor={ukColors.faint}
                />
              </View>
            ))}
          </View>

          <View style={styles.netRow}>
            <Text style={styles.netLabel}>Net</Text>
            <Text style={styles.netValue}>{net}</Text>
          </View>

          <View style={styles.sheetActions}>
            <Pressable style={styles.cancelBtn} onPress={closeResult}>
              <Text style={styles.cancelBtnText}>Vazgeç</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={() => void saveResult()}>
              <Text style={styles.saveBtnText}>Kaydet</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function Section({
  title,
  action,
  onAction,
  children,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {action ? (
          <Pressable onPress={onAction}>
            <Text style={styles.sectionAction}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
  content: { padding: ukSpace.lg, paddingBottom: 40 },
  head: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: ukSpace.lg },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: ukColors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: ukColors.primary600, fontWeight: "800" },
  hi: { color: ukColors.muted, fontSize: 13, fontWeight: "600" },
  name: { color: ukColors.text, fontSize: 20, fontWeight: "800" },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: ukColors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: ukColors.border,
  },
  hero: {
    borderRadius: ukRadius.lg,
    padding: ukSpace.lg,
    backgroundColor: ukColors.primary,
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  heroTitle: { marginTop: 14, color: "#fff", fontSize: 22, fontWeight: "800" },
  heroSub: { marginTop: 6, color: "rgba(255,255,255,0.88)", fontWeight: "600" },
  heroBar: { marginTop: 14, height: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.18)" },
  heroBarFill: { height: 8, borderRadius: 999, backgroundColor: "#fff" },
  heroCta: {
    marginTop: 16,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  heroCtaText: { color: "#fff", fontWeight: "800" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: ukSpace.lg,
  },
  statCard: {
    width: "48%",
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    padding: ukSpace.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    gap: 4,
  },
  statLabel: { color: ukColors.muted, fontSize: 12, fontWeight: "700" },
  statValue: { marginTop: 4, fontSize: 22, fontWeight: "800" },
  section: { marginTop: ukSpace.lg },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: ukColors.text },
  sectionAction: { color: ukColors.primary600, fontWeight: "700" },
  empty: { flexDirection: "row", alignItems: "center", gap: 10, padding: ukSpace.md },
  emptyText: { color: ukColors.success, fontWeight: "700" },
  card: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    padding: ukSpace.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    marginBottom: 10,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  cardTitle: { fontSize: 14, fontWeight: "800", color: ukColors.text },
  cardMeta: { marginTop: 4, fontSize: 12, fontWeight: "600", color: ukColors.muted },
  resultBtn: {
    backgroundColor: ukColors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resultBtnText: { color: ukColors.primary600, fontSize: 12, fontWeight: "800" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickItem: {
    width: "31%",
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: ukColors.border,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: ukColors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: { marginTop: 8, fontSize: 11, fontWeight: "700", color: ukColors.text, textAlign: "center" },
  // Sheet
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: ukColors.surface,
    borderTopLeftRadius: ukRadius.xl,
    borderTopRightRadius: ukRadius.xl,
    padding: ukSpace.lg,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: ukColors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 17, fontWeight: "800", color: ukColors.text },
  sheetSub: { marginTop: 4, color: ukColors.muted, fontWeight: "600", marginBottom: ukSpace.lg },
  sheetRow: { flexDirection: "row", gap: 12 },
  sheetField: { flex: 1, alignItems: "center" },
  sheetFieldLabel: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  sheetInput: {
    width: "100%",
    borderWidth: 2,
    borderRadius: ukRadius.sm,
    padding: 12,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: ukColors.text,
  },
  netRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: ukSpace.lg,
    backgroundColor: ukColors.primarySoft,
    borderRadius: ukRadius.md,
    padding: ukSpace.md,
  },
  netLabel: { fontSize: 15, fontWeight: "800", color: ukColors.primary600 },
  netValue: { fontSize: 28, fontWeight: "800", color: ukColors.primary },
  sheetActions: { flexDirection: "row", gap: 12, marginTop: ukSpace.lg },
  cancelBtn: {
    flex: 1,
    borderRadius: ukRadius.md,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ukColors.bg,
    borderWidth: 1,
    borderColor: ukColors.border,
  },
  cancelBtnText: { color: ukColors.muted, fontWeight: "700" },
  saveBtn: {
    flex: 2,
    borderRadius: ukRadius.md,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ukColors.primary,
  },
  saveBtnText: { color: "#fff", fontWeight: "800" },
});
