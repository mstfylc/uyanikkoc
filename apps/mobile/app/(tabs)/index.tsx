import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { ScreenScroll } from "@/components/ScreenScroll";
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

export default function HomeTab() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

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
        // keep empty state
      }
    })();
  }, [token]);

  const pending = useMemo(() => assignments.filter((item) => !item.completed), [assignments]);
  const doneCount = assignments.length - pending.length;
  const pct = assignments.length > 0 ? Math.round((doneCount / assignments.length) * 100) : 0;
  const latestNet = exams[0]?.totalNet ?? 0;
  const firstName = user?.email.split("@")[0] ?? "Ogrenci";

  return (
    <ScreenScroll>
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstName.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.headText}>
          <Text style={styles.hi} numberOfLines={1}>Iyi calismalar,</Text>
          <Text style={styles.name} numberOfLines={1}>{firstName}</Text>
        </View>
        <Pressable style={styles.iconBtn}>
          <MIcon name="bell" size={20} color={ukColors.text} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.badge}>
            <MIcon name="flame" size={13} color="#fff" fill />
            <Text style={styles.badgeText}>12 gun seri</Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>
          {pending.length > 0 ? `Bugun ${pending.length} odevin var` : "Bugunun odevleri tamam!"}
        </Text>
        <Text style={styles.heroSub}>
          {doneCount} tamamlandi · {pending.length} bekliyor
        </Text>
        <View style={styles.heroBar}>
          <View style={[styles.heroBarFill, { width: `${pct}%` }]} />
        </View>
        <Pressable style={styles.heroCta} onPress={() => router.push("/(tabs)/assignments")}>
          <Text style={styles.heroCtaText}>Odevlere git</Text>
          <MIcon name="chevronRight" size={16} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Toplam Net</Text>
          <Text style={styles.statValue}>{latestNet.toFixed(1)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Bu hafta</Text>
          <Text style={styles.statValue}>23.5 sa</Text>
        </View>
      </View>

      <Section title="Bugunun odevleri" action="Tumu" onAction={() => router.push("/(tabs)/assignments")}>
        {pending.slice(0, 3).map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={[styles.dot, { backgroundColor: subjectColor(item.subject ?? "Matematik") }]} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardMeta} numberOfLines={1}>{item.subject ?? "Genel"} · {item.dueDate ?? "Tarih yok"}</Text>
            </View>
          </View>
        ))}
      </Section>

      <Section title="Hizli erisim">
        <View style={styles.quickGrid}>
          {[
            ["topics", "book", "Konu Takibi"],
            ["resources", "notebook", "Kaynaklarim"],
            ["appointments", "calendar", "Randevular"],
            ["messages", "message", "Mesajlar"],
            ["motivation", "heart", "Motivasyon"],
          ].map(([route, icon, label]) => (
            <Pressable key={route} style={styles.quickItem} onPress={() => router.push(`/sub/${route}` as never)}>
              <View style={styles.quickIcon}>
                <MIcon name={icon} size={21} color={ukColors.primary} fill={icon === "heart"} />
              </View>
              <Text style={styles.quickLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Section>
    </ScreenScroll>
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
  head: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: ukSpace.lg },
  headText: { flex: 1, minWidth: 0 },
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
  statsRow: { flexDirection: "row", gap: 12, marginTop: ukSpace.lg },
  statCard: {
    flex: 1,
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    padding: ukSpace.md,
    borderWidth: 1,
    borderColor: ukColors.border,
  },
  statLabel: { color: ukColors.muted, fontSize: 12, fontWeight: "700" },
  statValue: { marginTop: 8, color: ukColors.text, fontSize: 24, fontWeight: "800" },
  section: { marginTop: ukSpace.lg },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: ukColors.text },
  sectionAction: { color: ukColors.primary600, fontWeight: "700" },
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
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 14, fontWeight: "800", color: ukColors.text },
  cardMeta: { marginTop: 4, fontSize: 12, fontWeight: "600", color: ukColors.muted },
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
});
