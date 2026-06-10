import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { Badge, Card, SectionHead } from "@/components/parent-ui";
import { Chips, Sheet, SheetField } from "@/components/Sheet";
import { C_AUDIENCES, C_EXAM_ASSIGN, C_EXAM_TYPES, C_STUDENTS, type CoachExamAssign } from "@/lib/coach-data";
import { ukColors, ukSpace } from "@/lib/theme";

export default function CoachExam() {
  const router = useRouter();
  const [extra, setExtra] = useState<CoachExamAssign[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState(C_EXAM_TYPES[0]);
  const [date, setDate] = useState("2026-06-15");
  const [audience, setAudience] = useState(C_AUDIENCES[0]);
  const ok = name.trim().length > 1;

  const assign = () => {
    if (!ok) return;
    const taken = C_STUDENTS.filter((s) => s.status !== "new").map((s) => ({ sid: s.id, name: s.name, initials: s.initials, net: null }));
    setExtra((e) => [{ id: `ex-${Date.now()}`, name: name.trim(), type, date, audience, status: "yaklaşan", taken }, ...e]);
    setName("");
    setOpen(false);
    Alert.alert("Deneme atandı", `"${name.trim()}" ${taken.length} öğrenciye atandı.`);
  };

  const list = [...extra, ...C_EXAM_ASSIGN];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 8, paddingBottom: 28 }}>
      <View style={st.head}>
        <Pressable style={st.back} onPress={() => router.back()}><MIcon name="chevronLeft" size={20} color={ukColors.text} /></Pressable>
        <View><Text style={st.title}>Deneme Atama</Text><Text style={st.sub}>Öğrencilere deneme ata & takip et</Text></View>
      </View>

      <View style={{ paddingHorizontal: ukSpace.lg, marginBottom: 18 }}>
        <Pressable style={st.primaryBtn} onPress={() => setOpen(true)}><MIcon name="plus" size={17} color="#fff" /><Text style={{ color: "#fff", fontSize: 14.5, fontWeight: "700" }}>Yeni deneme ata</Text></Pressable>
      </View>

      <Sheet
        open={open}
        title="Deneme ata"
        sub="Öğrencilere yeni deneme"
        onClose={() => setOpen(false)}
        footer={<Pressable style={[st.primaryBtn, !ok && { opacity: 0.5 }]} disabled={!ok} onPress={assign}><MIcon name="check" size={17} color="#fff" /><Text style={{ color: "#fff", fontSize: 14.5, fontWeight: "700" }}>Ata</Text></Pressable>}
      >
        <SheetField label="Deneme adı"><TextInput style={st.input} value={name} onChangeText={setName} placeholder="Örn. TYT Genel Deneme #8" placeholderTextColor={ukColors.faint} /></SheetField>
        <SheetField label="Tür"><Chips options={C_EXAM_TYPES} value={type} onChange={setType} /></SheetField>
        <SheetField label="Tarih"><TextInput style={st.input} value={date} onChangeText={setDate} placeholder="YYYY-AA-GG" placeholderTextColor={ukColors.faint} /></SheetField>
        <SheetField label="Hedef kitle"><Chips options={C_AUDIENCES} value={audience} onChange={setAudience} /></SheetField>
      </Sheet>

      <SectionHead title="Denemeler" />
      <View style={{ paddingHorizontal: ukSpace.lg, gap: 10 }}>
        {list.map((e) => {
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
  input: { height: 46, borderRadius: 13, borderColor: ukColors.border, borderWidth: 1, paddingHorizontal: 14, fontSize: 14, color: ukColors.text, backgroundColor: ukColors.bg },
  miniAv: { width: 30, height: 30, borderRadius: 9, backgroundColor: ukColors.primarySoft, alignItems: "center", justifyContent: "center" },
  miniAvText: { color: ukColors.primary600, fontWeight: "800", fontSize: 11 },
});
