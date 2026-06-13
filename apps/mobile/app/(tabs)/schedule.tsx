import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { subjectColor, ukColors, ukRadius, ukSpace } from "@/lib/theme";

type StudyBlock = {
  id: string;
  day: string;
  time: string;
  subject: string;
  topic: string;
  type: string;
};

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const DAYS_FULL = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

function todayDayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

export default function ScheduleTab() {
  const { token } = useAuth();
  const [blocks, setBlocks] = useState<StudyBlock[]>([]);
  const [activeDay, setActiveDay] = useState(todayDayIndex());

  useEffect(() => {
    if (!token) return;
    void apiFetch<{ studyPlan: StudyBlock[] }>("/api/student/schedule", { token })
      .then((res) => setBlocks(res.studyPlan))
      .catch(() => setBlocks([]));
  }, [token]);

  const dayName = DAYS_FULL[activeDay] ?? "";
  const dayBlocks = blocks.filter((b) => b.day === dayName || b.day === DAYS[activeDay]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Çalışma Programı</Text>

      {/* Yatay gün seçici */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daySel}
      >
        {DAYS.map((day, i) => {
          const isToday = i === todayDayIndex();
          const isActive = i === activeDay;
          return (
            <Pressable
              key={day}
              style={[styles.dayItem, isActive && styles.dayItemActive]}
              onPress={() => setActiveDay(i)}
            >
              <Text style={[styles.dayShort, isActive && styles.dayShortActive]}>{day}</Text>
              {isToday && <View style={[styles.todayDot, isActive && styles.todayDotActive]} />}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Seçili gün başlığı */}
      <Text style={styles.dayHeading}>{dayName}</Text>

      {dayBlocks.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Bu gün için çalışma bloğu yok.</Text>
        </View>
      ) : (
        dayBlocks.map((block) => (
          <View key={block.id} style={styles.blockCard}>
            <View style={[styles.blockStripe, { backgroundColor: subjectColor(block.subject) }]} />
            <View style={styles.blockBody}>
              <View style={styles.blockTop}>
                <Text style={styles.blockSubject}>{block.subject}</Text>
                <Text style={styles.blockTime}>{block.time}</Text>
              </View>
              <Text style={styles.blockTopic}>{block.topic}</Text>
              <View style={styles.blockTypePill}>
                <Text style={styles.blockTypeText}>{block.type}</Text>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
  content: { padding: ukSpace.lg, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "800", color: ukColors.text, marginBottom: ukSpace.md },
  daySel: { flexDirection: "row", gap: 8, paddingBottom: ukSpace.md },
  dayItem: {
    width: 48,
    height: 56,
    borderRadius: ukRadius.md,
    backgroundColor: ukColors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: ukColors.border,
    gap: 6,
  },
  dayItemActive: {
    backgroundColor: ukColors.primary,
    borderColor: ukColors.primary,
  },
  dayShort: { fontSize: 13, fontWeight: "800", color: ukColors.muted },
  dayShortActive: { color: "#fff" },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ukColors.primary,
  },
  todayDotActive: { backgroundColor: "#fff" },
  dayHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: ukColors.primary600,
    marginBottom: ukSpace.md,
  },
  blockCard: {
    flexDirection: "row",
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: ukColors.border,
    marginBottom: 12,
  },
  blockStripe: { width: 6 },
  blockBody: { flex: 1, padding: ukSpace.md },
  blockTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  blockSubject: { fontSize: 15, fontWeight: "800", color: ukColors.text },
  blockTime: { fontSize: 13, fontWeight: "700", color: ukColors.muted },
  blockTopic: { marginTop: 4, fontSize: 13, fontWeight: "600", color: ukColors.muted },
  blockTypePill: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: ukColors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  blockTypeText: { fontSize: 11, fontWeight: "800", color: ukColors.primary600 },
  emptyWrap: { alignItems: "center", padding: ukSpace.xl },
  emptyText: { color: ukColors.muted, fontWeight: "600" },
});
