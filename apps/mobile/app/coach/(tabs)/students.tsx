import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { Badge, Card, PageTitle } from "@/components/parent-ui";
import { C_STATUS, C_STUDENTS } from "@/lib/coach-data";
import { ukColors, ukSpace } from "@/lib/theme";

const FILTERS = [
  { k: "all", label: "Tümü" },
  { k: "risk", label: "Risk" },
  { k: "ok", label: "Yolunda" },
  { k: "new", label: "Yeni" },
];

export default function CoachStudents() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const list = filter === "all" ? C_STUDENTS : C_STUDENTS.filter((s) => s.status === filter);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 28 }}>
      <PageTitle title="Öğrencilerim" sub={`${C_STUDENTS.length} öğrenci · ${C_STUDENTS.filter((s) => s.status === "risk").length} risk`} />

      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: ukSpace.lg, marginBottom: 12 }}>
        {FILTERS.map((f) => {
          const on = filter === f.k;
          return (
            <Pressable key={f.k} onPress={() => setFilter(f.k)} style={[st.seg, on && st.segOn]}>
              <Text style={[st.segText, on && { color: "#fff" }]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ paddingHorizontal: ukSpace.lg, gap: 10 }}>
        {list.map((s) => {
          const meta = C_STATUS[s.status];
          return (
            <Pressable key={s.id} onPress={() => router.push({ pathname: "/coach/sub/student", params: { id: s.id } })}>
              <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={st.avatar}><Text style={st.avatarText}>{s.initials}</Text></View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: ukColors.text }}>{s.name}</Text>
                    <Badge tone={meta.tone} label={meta.label} />
                  </View>
                  <Text style={{ fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 3 }}>{s.grade} · {s.lastActive}</Text>
                  {s.status !== "new" ? (
                    <View style={{ flexDirection: "row", gap: 14, marginTop: 7 }}>
                      <Text style={st.kv}>%{s.completion} <Text style={st.kvLab}>tamamlama</Text></Text>
                      <Text style={st.kv}>{s.net} <Text style={st.kvLab}>net</Text></Text>
                      <Text style={st.kv}>{s.streak}🔥</Text>
                    </View>
                  ) : null}
                </View>
                <MIcon name="chevronRight" size={18} color={ukColors.faint} />
              </Card>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  seg: { paddingHorizontal: 14, height: 34, borderRadius: 999, backgroundColor: ukColors.surface, borderColor: ukColors.border, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  segOn: { backgroundColor: ukColors.primary, borderColor: ukColors.primary },
  segText: { fontSize: 13, fontWeight: "700", color: ukColors.text },
  avatar: { width: 46, height: 46, borderRadius: 14, backgroundColor: ukColors.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  kv: { fontSize: 13, fontWeight: "800", color: ukColors.text },
  kvLab: { fontSize: 11, fontWeight: "600", color: ukColors.muted },
});
