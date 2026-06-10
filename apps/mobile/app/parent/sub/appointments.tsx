import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { Badge, Card, SectionHead } from "@/components/parent-ui";
import { useParent } from "@/lib/parent-context";
import { ukColors, ukSpace } from "@/lib/theme";

export default function ParentAppointments() {
  const router = useRouter();
  const { child } = useParent();
  const u = child.upcoming;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 8, paddingBottom: 28 }}>
      <View style={st.head}>
        <Pressable style={st.back} onPress={() => router.back()}><MIcon name="chevronLeft" size={20} color={ukColors.text} /></Pressable>
        <View><Text style={st.title}>Randevular</Text><Text style={st.sub}>{child.name} · koç görüşmeleri</Text></View>
      </View>

      <View style={{ marginTop: 4 }}>
        <SectionHead title="Yaklaşan" />
        <View style={{ paddingHorizontal: ukSpace.lg }}>
          <Card style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
            <View style={st.ic}><MIcon name="calendar" size={22} color={ukColors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14.5, fontWeight: "700", color: ukColors.text }}>{child.coach} ile görüşme</Text>
              <Text style={{ fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>{u.date} · {u.time}</Text>
            </View>
            <Badge tone="success" label="Onaylı" />
          </Card>
        </View>
      </View>

      <View style={{ paddingHorizontal: ukSpace.lg, marginTop: 18 }}>
        <Pressable style={st.primaryBtn}><MIcon name="plus" size={17} color="#fff" /><Text style={st.primaryBtnText}>Yeni randevu talep et</Text></Pressable>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: ukSpace.lg, paddingBottom: 12, paddingTop: 4 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: ukColors.surface, borderColor: ukColors.border, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: ukColors.text },
  sub: { fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 2 },
  ic: { width: 44, height: 44, borderRadius: 12, backgroundColor: ukColors.primarySoft, alignItems: "center", justifyContent: "center" },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 15, backgroundColor: ukColors.primary },
  primaryBtnText: { color: "#fff", fontSize: 14.5, fontWeight: "700" },
});
