import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { MIcon } from "@/components/MIcon";
import { Badge, Card, PageTitle, SectionHead } from "@/components/parent-ui";
import { useParent } from "@/lib/parent-context";
import { subjectColor, ukColors, ukSpace } from "@/lib/theme";
import type { ParentReport } from "@/lib/parent-data";

export default function ParentReports() {
  const { child } = useParent();
  const [sel, setSel] = useState<ParentReport | null>(null);

  if (sel) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 28 }}>
        <View style={st.subHead}>
          <Pressable style={st.backBtn} onPress={() => setSel(null)}><MIcon name="chevronLeft" size={20} color={ukColors.text} /></Pressable>
          <View><Text style={st.subTitle}>{sel.week}</Text><Text style={st.subSub}>{child.name} · gelişim raporu</Text></View>
        </View>
        <View style={{ paddingHorizontal: ukSpace.lg }}>
          <View style={st.hero}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              {[["Tamamlama", `%${sel.completion}`], ["Toplam Net", `${sel.net}`], ["Çalışma", `${sel.hours} sa`]].map(([l, v]) => (
                <View key={l}><Text style={st.heroVal}>{v}</Text><Text style={st.heroLab}>{l}</Text></View>
              ))}
            </View>
          </View>
        </View>
        <View style={{ marginTop: 20 }}>
          <SectionHead title="Ders bazlı ilerleme" />
          <View style={{ paddingHorizontal: ukSpace.lg }}>
            <Card>
              {child.subjects.map((s) => {
                const c = subjectColor(s.name);
                return (
                  <View key={s.name} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}><View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: c }} /><Text style={{ fontSize: 13.5, fontWeight: "700", color: ukColors.text }}>{s.name}</Text></View>
                      <Text style={{ fontSize: 12.5, fontWeight: "700", color: ukColors.muted }}>net {s.net}</Text>
                    </View>
                    <View style={st.bar}><View style={[st.barFill, { width: `${s.pct}%`, backgroundColor: c }]} /></View>
                  </View>
                );
              })}
            </Card>
          </View>
        </View>
        <View style={{ paddingHorizontal: ukSpace.lg, marginTop: 16 }}>
          <Card style={{ flexDirection: "row", gap: 13, alignItems: "flex-start" }}>
            <View style={st.coachAv}><Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>{child.coachInitials}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13.5, fontWeight: "800", color: ukColors.text }}>{child.coach} — Koç notu</Text>
              <Text style={{ fontSize: 13, color: ukColors.text, opacity: 0.85, marginTop: 5, lineHeight: 20 }}>{sel.note}</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 28 }}>
      <PageTitle title="Gelişim Raporları" sub={`${child.name} · koçun haftalık değerlendirmesi`} />
      <View style={{ paddingHorizontal: ukSpace.lg, gap: 10 }}>
        {child.reports.map((r) => (
          <Pressable key={r.id} onPress={() => setSel(r)}>
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}><Text style={{ fontSize: 15, fontWeight: "800", color: ukColors.text }}>{r.week}</Text><Text style={{ fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>{r.date}</Text></View>
                {r.status === "yeni" ? <Badge tone="primary" label="Yeni" /> : <Badge label="Okundu" />}
              </View>
              <View style={{ flexDirection: "row", gap: 18, marginTop: 14 }}>
                {[["Tamamlama", `%${r.completion}`], ["Net", `${r.net}`], ["Çalışma", `${r.hours} sa`]].map(([l, v]) => (
                  <View key={l}><Text style={{ fontSize: 18, fontWeight: "800", color: ukColors.text }}>{v}</Text><Text style={{ fontSize: 11, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>{l}</Text></View>
                ))}
              </View>
              <Text style={{ fontSize: 12.5, fontWeight: "700", color: ukColors.primary600, marginTop: 12 }}>Raporu gör ›</Text>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  subHead: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: ukSpace.lg, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: ukColors.surface, borderColor: ukColors.border, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  subTitle: { fontSize: 18, fontWeight: "800", color: ukColors.text },
  subSub: { fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 2 },
  hero: { backgroundColor: ukColors.primary, borderRadius: 20, padding: 18 },
  heroVal: { fontSize: 24, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  heroLab: { fontSize: 11.5, color: "rgba(255,255,255,0.82)", fontWeight: "600", marginTop: 3 },
  bar: { height: 7, borderRadius: 999, backgroundColor: ukColors.surface3, overflow: "hidden" },
  barFill: { height: 7, borderRadius: 999 },
  coachAv: { width: 42, height: 42, borderRadius: 12, backgroundColor: ukColors.primary, alignItems: "center", justifyContent: "center" },
});
