import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ScreenScroll } from "@/components/ScreenScroll";
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

export default function ScheduleTab() {
  const { token } = useAuth();
  const [blocks, setBlocks] = useState<StudyBlock[]>([]);

  useEffect(() => {
    if (!token) return;
    void apiFetch<{ studyPlan: StudyBlock[] }>("/api/student/schedule", { token })
      .then((res) => setBlocks(res.studyPlan))
      .catch(() => setBlocks([]));
  }, [token]);

  const grouped = blocks.reduce<Record<string, StudyBlock[]>>((acc, block) => {
    acc[block.day] = acc[block.day] ?? [];
    acc[block.day].push(block);
    return acc;
  }, {});

  return (
    <ScreenScroll>
      <Text style={styles.title}>Calisma Programi</Text>
      <Text style={styles.sub}>Haftalik plan</Text>
      {Object.entries(grouped).map(([day, dayBlocks]) => (
        <View key={day} style={styles.daySection}>
          <Text style={styles.dayTitle}>{day}</Text>
          {dayBlocks.map((block) => (
            <View key={block.id} style={styles.card}>
              <View style={[styles.dot, { backgroundColor: subjectColor(block.subject) }]} />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>{block.subject}</Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {block.time} · {block.topic} · {block.type}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "800", color: ukColors.text },
  sub: { marginTop: 4, marginBottom: ukSpace.lg, color: ukColors.muted, fontWeight: "600" },
  daySection: { marginBottom: ukSpace.lg },
  dayTitle: { fontSize: 15, fontWeight: "800", color: ukColors.primary600, marginBottom: 10 },
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
});
