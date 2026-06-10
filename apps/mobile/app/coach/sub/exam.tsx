import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { Badge, Card, SectionHead } from "@/components/parent-ui";
import { C_EXAM_ASSIGN } from "@/lib/coach-data";
import { ukColors, ukSpace } from "@/lib/theme";

export default function CoachExam() {
  const router = useRouter();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 8, paddingBottom: 28 }}>
      <View style={st.head}>
        <Pressable style={st.back} onPress={() => router.back()}><MIcon name="chevronLeft" size={20} color={ukColors.text} /></Pressable>
        <View><Text style={st.title}>Deneme Atama</Text><Text style={st.sub}>Öğrencilere deneme ata & takip et</Text></View>
      </View>

      <View style={{ paddingHorizontal: ukSpace.lg, marginBottom: 18 }}>
        <Pressable style={st.primaryBtn}><MIcon name="plus" size={17} color="#fff" /><Text style={{ color: "#fff", fontSize: 14.5, fontWeight: "700" }}>Yeni deneme ata</Text></Pressable>
      </View>

      <SectionHead title="Denemeler" />
      <View style={{ paddingHorizontal: ukSpace.lg, gap: 10 }}>
        {C_EXAM_ASSIGN.map((e) => {
          const completed = e.taken.filter((t) => t.net != null).length;
          return (
            <Card key={e.id}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: ukColors.text }}>{e.name}</Text>
                  <Text style={{ fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>{e.type} · {e.date} · {e.audience}</Text>
                </View>
                <Badge tone={e.status === "tamamlandı" ? "success" : "info"} label={e.status} />
              </View>
              <View style={{ marginTop: 12, gap: 7 }}>
                {e.taken.map((t) => (
                  <View key={t.sid} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={st.miniAv}><Text style={st.miniAvText}>{t.initials}</Text></View>
                    <Text style={{ flex: 1, fontSize: 13, fontWeight: "600", color: ukColors.text }}>{t.name}</Text>
                    {t.net != null ? <Text style={{ fontSize: 13, fontWeight: "800", color: ukColors.success }}>net {t.net}</Text> : <Text style={{ fontSize: 12, color: ukColors.faint, fontWeight: "600" }}>bekliyor</Text>}
                  </View>
                ))}
              </View>
              <Text style={{ fontSize: 11.5, color: ukColors.muted, fontWeight: "600", marginTop: 10 }}>{completed}/{e.taken.length} tamamladı</Text>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: ukSpace.lg, paddingBottom: 12, paddingTop: 4 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: ukColors.surface, borderColor: ukColors.border, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: ukColors.text },
  sub: { fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 2 },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 15, backgroundColor: ukColors.primary },
  miniAv: { width: 30, height: 30, borderRadius: 9, backgroundColor: ukColors.primarySoft, alignItems: "center", justifyContent: "center" },
  miniAvText: { color: ukColors.primary600, fontWeight: "800", fontSize: 11 },
});
