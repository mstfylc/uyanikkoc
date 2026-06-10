import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge, Card, PageTitle, SectionHead } from "@/components/parent-ui";
import { C_APPTS } from "@/lib/coach-data";
import { ukColors, ukSpace } from "@/lib/theme";

const DAY_LABEL: Record<string, string> = {
  Cmt: "Cumartesi · 6 Haz", Paz: "Pazar · 7 Haz", Pzt: "Pazartesi · 8 Haz", Sal: "Salı · 9 Haz", Çar: "Çarşamba · 10 Haz", Per: "Perşembe", Cum: "Cuma",
};
const ORDER = ["Cmt", "Paz", "Pzt", "Sal", "Çar", "Per", "Cum"];

export default function CoachProgram() {
  const days = ORDER.filter((d) => C_APPTS.some((a) => a.day === d));
  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 28 }}>
      <PageTitle title="Program" sub={`${C_APPTS.length} randevu · bu hafta`} />
      {days.map((d) => (
        <View key={d} style={{ marginBottom: 8 }}>
          <SectionHead title={DAY_LABEL[d] ?? d} />
          {C_APPTS.filter((a) => a.day === d).map((a) => (
            <Card key={a.id} style={{ marginHorizontal: ukSpace.lg, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={st.timeBox}><Text style={st.timeText}>{a.time}</Text><Text style={st.timeEnd}>{a.end}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: ukColors.text }}>{a.student}</Text>
                <Text style={{ fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>{a.topic}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 5 }}>
                <Badge label={a.mode} tone={a.mode === "Online" ? "info" : a.mode === "Telefon" ? "warning" : "success"} />
                <Badge label={a.status} tone={a.status === "onaylı" ? "success" : "warning"} />
              </View>
            </Card>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  timeBox: { width: 56, alignItems: "center", justifyContent: "center" },
  timeText: { fontSize: 14, fontWeight: "800", color: ukColors.primary600 },
  timeEnd: { fontSize: 11, fontWeight: "600", color: ukColors.faint, marginTop: 2 },
});
