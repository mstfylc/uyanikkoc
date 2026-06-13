import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

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

export default function AssignmentsTab() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    if (!token) return;
    void apiFetch<{ assignments: Assignment[] }>("/api/student/assignments", { token })
      .then((res) => setAssignments(res.assignments))
      .catch(() => setAssignments([]));
  }, [token]);

  return (
    <ScreenScroll>
      <Text style={styles.title}>Odevlerim</Text>
      <Text style={styles.sub}>{assignments.length} kayit</Text>
      {assignments.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={[styles.dot, { backgroundColor: subjectColor(item.subject ?? "Matematik") }]} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {item.subject ?? "Genel"} · {item.dueDate ?? "Tarih yok"}
            </Text>
          </View>
          <Text style={[styles.status, item.completed ? styles.done : styles.pending]}>
            {item.completed ? "Tamam" : "Bekliyor"}
          </Text>
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
    gap: 12,
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
  status: { fontSize: 12, fontWeight: "800", flexShrink: 0 },
  done: { color: ukColors.success },
  pending: { color: ukColors.warning },
});
