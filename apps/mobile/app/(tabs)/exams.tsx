import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

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
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Denemeler</Text>
      <Text style={styles.sub}>{exams.length} sonuc</Text>
      {exams.map((exam) => (
        <View key={exam.id} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{exam.label ?? "Deneme"}</Text>
            <Text style={styles.cardMeta}>
              {exam.examType} · {exam.takenAt}
            </Text>
          </View>
          <Text style={styles.net}>{exam.totalNet.toFixed(1)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
  content: { padding: ukSpace.lg, paddingBottom: 40 },
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
  cardTitle: { fontSize: 14, fontWeight: "800", color: ukColors.text },
  cardMeta: { marginTop: 4, fontSize: 12, fontWeight: "600", color: ukColors.muted },
  net: { fontSize: 22, fontWeight: "800", color: ukColors.primary },
});
