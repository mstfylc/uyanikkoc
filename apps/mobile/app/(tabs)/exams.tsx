import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ScreenScroll } from "@/components/ScreenScroll";
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

export default function ExamsTab() {
  const { token } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    if (!token) return;
    void apiFetch<{ exams: Exam[] }>("/api/student/exams", { token })
      .then((res) => setExams(res.exams))
      .catch(() => setExams([]));
  }, [token]);

  return (
    <ScreenScroll>
      <Text style={styles.title}>Denemeler</Text>
      <Text style={styles.sub}>{exams.length} sonuc</Text>
      {exams.map((exam) => (
        <View key={exam.id} style={styles.card}>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={1}>{exam.label ?? "Deneme"}</Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {exam.examType} · {exam.takenAt}
            </Text>
          </View>
          <Text style={styles.net}>{exam.totalNet.toFixed(1)}</Text>
        </View>
      ))}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "800", color: ukColors.text },
  sub: { marginTop: 4, marginBottom: ukSpace.lg, color: ukColors.muted, fontWeight: "600" },
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
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 14, fontWeight: "800", color: ukColors.text },
  cardMeta: { marginTop: 4, fontSize: 12, fontWeight: "600", color: ukColors.muted },
  net: { fontSize: 22, fontWeight: "800", color: ukColors.primary, marginLeft: 12, flexShrink: 0 },
});
