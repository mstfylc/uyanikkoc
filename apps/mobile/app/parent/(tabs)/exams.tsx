import { ScrollView, StyleSheet, Text, View } from "react-native";

import { MIcon } from "@/components/MIcon";
import { Badge, Card, PageTitle, SectionHead } from "@/components/parent-ui";
import { useParent } from "@/lib/parent-context";
import { ukColors, ukSpace } from "@/lib/theme";

export default function ParentExams() {
  const { child } = useParent();
  const maxTrend = Math.max(...child.trend.map((d) => d.v), 1);
  const latest = child.exams[0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 28 }}>
      <PageTitle title="Denemeler" sub={`${child.name} · ${child.exams.length} deneme`} />

      <View style={{ paddingHorizontal: ukSpace.lg }}>
        <Card>
          <Text style={{ fontSize: 13, fontWeight: "700", color: ukColors.muted }}>Net Gelişimi</Text>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 4 }}>
            <Text style={{ fontSize: 30, fontWeight: "800", color: ukColors.text, letterSpacing: -0.6 }}>{latest.net}</Text>
            <Badge tone="success" icon="arrowUp" label={latest.delta} />
          </View>
          <View style={st.chart}>
            {child.trend.map((d, i) => {
              const peak = i === child.trend.length - 1;
              return (
                <View key={i} style={st.col}>
                  <Text style={st.colVal}>{d.v}</Text>
                  <View style={st.track}>
                    <View style={[st.fill, { height: `${(d.v / maxTrend) * 100}%`, backgroundColor: peak ? ukColors.primary : ukColors.primary300 }]} />
                  </View>
                  <Text style={st.colLabel}>{d.l}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      <View style={{ marginTop: 22 }}>
        <SectionHead title="Geçmiş denemeler" />
        {child.exams.map((e) => {
          const up = !e.delta.startsWith("-");
          return (
            <Card key={e.id} style={{ marginHorizontal: ukSpace.lg, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={st.examIc}><MIcon name="chart" size={22} color={ukColors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14.5, fontWeight: "700", color: ukColors.text }}>{e.name}</Text>
                <Text style={{ fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>{e.pub} · {e.date}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 7 }}>
                  <Badge label={e.type} />
                  <Text style={{ fontSize: 11.5, color: ukColors.muted, fontWeight: "600" }}>{e.rank}</Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: ukColors.text }}>{e.net}</Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color: up ? ukColors.success : ukColors.danger }}>{up ? "▲" : "▼"} {e.delta}</Text>
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  chart: { flexDirection: "row", alignItems: "flex-end", gap: 10, height: 140, marginTop: 16 },
  col: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 6 },
  colVal: { fontSize: 11, fontWeight: "700", color: ukColors.muted },
  track: { width: "70%", height: 90, backgroundColor: ukColors.surface3, borderRadius: 8, justifyContent: "flex-end", overflow: "hidden" },
  fill: { width: "100%", borderRadius: 8 },
  colLabel: { fontSize: 11, fontWeight: "700", color: ukColors.muted },
  examIc: { width: 44, height: 44, borderRadius: 12, backgroundColor: ukColors.primarySoft, alignItems: "center", justifyContent: "center" },
});
