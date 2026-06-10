import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { Badge, Card, SectionHead } from "@/components/parent-ui";
import { C_STATUS, cStudent } from "@/lib/coach-data";
import { subjectColor, ukColors, ukSpace } from "@/lib/theme";

export default function CoachStudentDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = cStudent(typeof id === "string" ? id : "");

  if (!s) {
    return (
      <View style={{ flex: 1, backgroundColor: ukColors.bg, padding: ukSpace.lg }}>
        <Pressable style={head.back} onPress={() => router.back()}><MIcon name="chevronLeft" size={20} color={ukColors.text} /></Pressable>
        <Text style={{ color: ukColors.muted, marginTop: 16 }}>Öğrenci bulunamadı.</Text>
      </View>
    );
  }

  const meta = C_STATUS[s.status];
  const pending = s.odev.filter((o) => o.status === "pending");
  const submitted = s.odev.filter((o) => o.status === "submitted");

  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 8, paddingBottom: 28 }}>
      <View style={head.bar}>
        <Pressable style={head.back} onPress={() => router.back()}><MIcon name="chevronLeft" size={20} color={ukColors.text} /></Pressable>
        <Text style={head.title}>Öğrenci detayı</Text>
      </View>

      <View style={{ paddingHorizontal: ukSpace.lg }}>
        <Card style={{ alignItems: "center" }}>
          <View style={head.avatar}><Text style={{ color: "#fff", fontWeight: "800", fontSize: 22 }}>{s.initials}</Text></View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: ukColors.text }}>{s.name}</Text>
            <Badge tone={meta.tone} label={meta.label} />
          </View>
          <Text style={{ fontSize: 13, color: ukColors.muted, fontWeight: "600", marginTop: 3 }}>{s.grade} · {s.goal}</Text>
          {s.status !== "new" ? (
            <View style={{ flexDirection: "row", gap: 22, marginTop: 14 }}>
              {[[`%${s.completion}`, "tamamlama"], [`${s.net}`, "net"], [`${s.streak}`, "seri"], [`${s.weekHours}sa`, "bu hafta"]].map(([v, l]) => (
                <View key={l} style={{ alignItems: "center" }}><Text style={{ fontSize: 17, fontWeight: "800", color: ukColors.text }}>{v}</Text><Text style={{ fontSize: 11, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>{l}</Text></View>
              ))}
            </View>
          ) : null}
        </Card>
      </View>

      <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: ukSpace.lg, marginTop: 12 }}>
        <Pressable style={act.btn} onPress={() => router.push("/coach/messages")}><MIcon name="message" size={17} color={ukColors.primary600} /><Text style={act.btnText}>Mesaj</Text></Pressable>
        <Pressable style={act.btn} onPress={() => router.push("/coach/program")}><MIcon name="calendar" size={17} color={ukColors.primary600} /><Text style={act.btnText}>Randevu</Text></Pressable>
        <Pressable style={[act.btn, { backgroundColor: ukColors.primary }]}><MIcon name="plus" size={17} color="#fff" /><Text style={[act.btnText, { color: "#fff" }]}>Ödev ata</Text></Pressable>
      </View>

      {submitted.length > 0 ? (
        <View style={{ marginTop: 20 }}>
          <SectionHead title={`İnceleme bekleyen · ${submitted.length}`} />
          {submitted.map((o) => (
            <Card key={o.id} style={{ marginHorizontal: ukSpace.lg, marginBottom: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={[odevIc(o.subject)]}><MIcon name="book" size={18} color={subjectColor(o.subject)} /></View>
                <View style={{ flex: 1 }}><Text style={{ fontSize: 14, fontWeight: "700", color: ukColors.text }}>{o.topic}</Text><Text style={{ fontSize: 12, color: ukColors.muted, marginTop: 2 }}>{o.subject}</Text></View>
                <Badge tone="warning" label="Gönderildi" />
              </View>
            </Card>
          ))}
        </View>
      ) : null}

      <View style={{ marginTop: 20 }}>
        <SectionHead title={`Bekleyen ödevler · ${pending.length}`} />
        {pending.length === 0 ? <View style={{ paddingHorizontal: ukSpace.lg }}><Card><Text style={{ color: ukColors.muted, fontSize: 13 }}>Bekleyen ödev yok.</Text></Card></View> : pending.map((o) => (
          <Card key={o.id} style={{ marginHorizontal: ukSpace.lg, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={[odevIc(o.subject)]}><MIcon name="book" size={18} color={subjectColor(o.subject)} /></View>
            <View style={{ flex: 1 }}><Text style={{ fontSize: 14, fontWeight: "700", color: ukColors.text }}>{o.topic}</Text><Text style={{ fontSize: 12, color: ukColors.muted, marginTop: 2 }}>{o.subject} · {o.source}</Text></View>
          </Card>
        ))}
      </View>

      {s.subjects.length > 0 ? (
        <View style={{ marginTop: 20 }}>
          <SectionHead title="Ders bazlı ilerleme" />
          <View style={{ paddingHorizontal: ukSpace.lg }}>
            <Card>
              {s.subjects.map((sub) => {
                const c = subjectColor(sub.name);
                return (
                  <View key={sub.name} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                      <Text style={{ fontSize: 13.5, fontWeight: "700", color: ukColors.text }}>{sub.name}</Text>
                      <Text style={{ fontSize: 12.5, fontWeight: "700", color: ukColors.muted }}>net {sub.net}</Text>
                    </View>
                    <View style={bar.track}><View style={[bar.fill, { width: `${sub.pct}%`, backgroundColor: c }]} /></View>
                  </View>
                );
              })}
            </Card>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function odevIc(subject: string) {
  return { width: 36, height: 36, borderRadius: 11, backgroundColor: subjectColor(subject) + "22", alignItems: "center" as const, justifyContent: "center" as const };
}

const head = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: ukSpace.lg, paddingBottom: 12, paddingTop: 4 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: ukColors.surface, borderColor: ukColors.border, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: ukColors.text },
  avatar: { width: 68, height: 68, borderRadius: 22, backgroundColor: ukColors.primary, alignItems: "center", justifyContent: "center" },
});
const act = StyleSheet.create({
  btn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 44, borderRadius: 13, backgroundColor: ukColors.surface, borderColor: ukColors.border, borderWidth: 1 },
  btnText: { fontSize: 13, fontWeight: "700", color: ukColors.primary600 },
});
const bar = StyleSheet.create({
  track: { height: 7, borderRadius: 999, backgroundColor: ukColors.surface3, overflow: "hidden" },
  fill: { height: 7, borderRadius: 999 },
});
