import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { Badge, Card, SectionHead } from "@/components/parent-ui";
import { C_ANNOUNCEMENTS, C_AUDIENCES } from "@/lib/coach-data";
import { ukColors, ukSpace } from "@/lib/theme";

export default function CoachAnnouncement() {
  const router = useRouter();
  const [list, setList] = useState(C_ANNOUNCEMENTS);
  const [audience, setAudience] = useState(C_AUDIENCES[0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const publish = () => {
    if (title.trim().length < 2 || body.trim().length < 2) return;
    setList((l) => [{ id: `an${Date.now()}`, title: title.trim(), body: body.trim(), audience, time: "şimdi", reach: 8 }, ...l]);
    setTitle("");
    setBody("");
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 8, paddingBottom: 28 }}>
      <View style={st.head}>
        <Pressable style={st.back} onPress={() => router.back()}><MIcon name="chevronLeft" size={20} color={ukColors.text} /></Pressable>
        <View><Text style={st.title}>Duyuru</Text><Text style={st.sub}>Öğrenci & velilere toplu mesaj</Text></View>
      </View>

      <View style={{ paddingHorizontal: ukSpace.lg }}>
        <Card>
          <Text style={st.fieldLabel}>Hedef kitle</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6, marginBottom: 12 }}>
            {C_AUDIENCES.map((a) => {
              const on = a === audience;
              return <Pressable key={a} onPress={() => setAudience(a)} style={[st.chip, on && st.chipOn]}><Text style={[st.chipText, on && { color: "#fff" }]}>{a}</Text></Pressable>;
            })}
          </View>
          <Text style={st.fieldLabel}>Başlık</Text>
          <TextInput style={st.input} value={title} onChangeText={setTitle} placeholder="Duyuru başlığı" placeholderTextColor={ukColors.faint} />
          <Text style={[st.fieldLabel, { marginTop: 10 }]}>Mesaj</Text>
          <TextInput style={[st.input, { height: 90, textAlignVertical: "top" }]} value={body} onChangeText={setBody} placeholder="Duyuru metni…" placeholderTextColor={ukColors.faint} multiline />
          <Pressable style={st.publish} onPress={publish}><MIcon name="send" size={16} color="#fff" /><Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>Gönder</Text></Pressable>
        </Card>
      </View>

      <View style={{ marginTop: 22 }}>
        <SectionHead title="Geçmiş duyurular" />
        <View style={{ paddingHorizontal: ukSpace.lg, gap: 10 }}>
          {list.map((a) => (
            <Card key={a.id}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 14.5, fontWeight: "800", color: ukColors.text, flex: 1 }}>{a.title}</Text>
                <Badge label={a.audience} tone="primary" />
              </View>
              <Text style={{ fontSize: 13, color: ukColors.text, opacity: 0.85, marginTop: 7, lineHeight: 19 }}>{a.body}</Text>
              <Text style={{ fontSize: 11.5, color: ukColors.muted, fontWeight: "600", marginTop: 8 }}>{a.time} · {a.reach} kişiye ulaştı</Text>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: ukSpace.lg, paddingBottom: 12, paddingTop: 4 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: ukColors.surface, borderColor: ukColors.border, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: ukColors.text },
  sub: { fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 2 },
  fieldLabel: { fontSize: 11.5, fontWeight: "700", color: ukColors.muted },
  chip: { paddingHorizontal: 12, height: 32, borderRadius: 999, backgroundColor: ukColors.surface3, alignItems: "center", justifyContent: "center" },
  chipOn: { backgroundColor: ukColors.primary },
  chipText: { fontSize: 12.5, fontWeight: "700", color: ukColors.text },
  input: { height: 46, borderRadius: 13, borderColor: ukColors.border, borderWidth: 1, paddingHorizontal: 14, fontSize: 14, color: ukColors.text, backgroundColor: ukColors.bg, marginTop: 6 },
  publish: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 13, backgroundColor: ukColors.primary, marginTop: 14 },
});
