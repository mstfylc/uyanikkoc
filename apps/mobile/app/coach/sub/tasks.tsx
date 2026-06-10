import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { Badge, Card } from "@/components/parent-ui";
import { C_TASKS, C_TASK_PRIORITY } from "@/lib/coach-data";
import { ukColors, ukSpace } from "@/lib/theme";

export default function CoachTasks() {
  const router = useRouter();
  const [tasks, setTasks] = useState(C_TASKS);
  const toggle = (id: string) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  const Row = ({ t }: { t: (typeof C_TASKS)[number] }) => {
    const p = C_TASK_PRIORITY[t.priority];
    return (
      <Card style={{ marginHorizontal: ukSpace.lg, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable onPress={() => toggle(t.id)} style={[st.check, t.done && st.checkOn]}>
          {t.done ? <MIcon name="check" size={14} color="#fff" /> : null}
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: t.done ? ukColors.faint : ukColors.text, textDecorationLine: t.done ? "line-through" : "none" }}>{t.text}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
            {t.student ? <Text style={{ fontSize: 12, color: ukColors.muted, fontWeight: "600" }}>{t.student}</Text> : null}
            <Text style={{ fontSize: 12, color: ukColors.muted, fontWeight: "600" }}>· {t.due}</Text>
          </View>
        </View>
        <Badge tone={p.tone} label={p.label} />
      </Card>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 8, paddingBottom: 28 }}>
      <View style={st.head}>
        <Pressable style={st.back} onPress={() => router.back()}><MIcon name="chevronLeft" size={20} color={ukColors.text} /></Pressable>
        <View><Text style={st.title}>Görevler</Text><Text style={st.sub}>{open.length} açık · {done.length} tamamlandı</Text></View>
      </View>
      {open.map((t) => <Row key={t.id} t={t} />)}
      {done.length > 0 ? <Text style={st.section}>Tamamlanan</Text> : null}
      {done.map((t) => <Row key={t.id} t={t} />)}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: ukSpace.lg, paddingBottom: 12, paddingTop: 4 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: ukColors.surface, borderColor: ukColors.border, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: ukColors.text },
  sub: { fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 2 },
  check: { width: 24, height: 24, borderRadius: 8, borderColor: ukColors.borderStrong, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  checkOn: { backgroundColor: ukColors.success, borderColor: ukColors.success },
  section: { fontSize: 13, fontWeight: "800", color: ukColors.muted, paddingHorizontal: ukSpace.lg, marginTop: 10, marginBottom: 8 },
});
