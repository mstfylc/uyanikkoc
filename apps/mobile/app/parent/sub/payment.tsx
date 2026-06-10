import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { Badge, Card, SectionHead } from "@/components/parent-ui";
import { P_BILLING } from "@/lib/parent-data";
import { ukColors, ukSpace } from "@/lib/theme";

export default function ParentPayment() {
  const router = useRouter();
  const b = P_BILLING;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 8, paddingBottom: 28 }}>
      <View style={st.head}>
        <Pressable style={st.back} onPress={() => router.back()}><MIcon name="chevronLeft" size={20} color={ukColors.text} /></Pressable>
        <View><Text style={st.title}>Ödeme & Abonelik</Text><Text style={st.sub}>Plan, kart ve faturalar</Text></View>
      </View>

      <View style={{ paddingHorizontal: ukSpace.lg }}>
        <View style={st.hero}>
          <View style={st.heroBadge}><MIcon name="shield" size={13} color="#fff" /><Text style={st.heroBadgeText}>Aktif abonelik</Text></View>
          <Text style={st.heroTitle}>{b.plan}</Text>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 8 }}>
            <Text style={{ fontSize: 30, fontWeight: "800", color: "#fff" }}>{b.price}</Text>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "600" }}>{b.cycle}</Text>
          </View>
          <Text style={{ color: "rgba(255,255,255,0.88)", fontSize: 13, marginTop: 8 }}>{b.children} öğrenci · {b.renew} tarihinde yenilenecek</Text>
        </View>
      </View>

      <View style={{ marginTop: 18 }}>
        <SectionHead title="Ödeme yöntemi" />
        <View style={{ paddingHorizontal: ukSpace.lg }}>
          <Card style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={st.visa}><Text style={{ color: "#fff", fontWeight: "800", fontSize: 11 }}>VISA</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: ukColors.text }}>•••• •••• •••• {b.card.last4}</Text>
              <Text style={{ fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>Son kullanma {b.card.exp}</Text>
            </View>
            <Pressable style={st.lightBtn} onPress={() => Alert.alert("Kart değiştir", "Güvenli ödeme sayfasına yönlendirileceksiniz. Bu özellik yakında uygulamada aktif olacak.")}><Text style={st.lightBtnText}>Değiştir</Text></Pressable>
          </Card>
        </View>
      </View>

      <View style={{ marginTop: 22 }}>
        <SectionHead title="Faturalar" />
        <View style={{ paddingHorizontal: ukSpace.lg, gap: 0 }}>
          <Card style={{ padding: 0 }}>
            {b.invoices.map((f, i) => (
              <View key={f.id} style={[st.invRow, i < b.invoices.length - 1 && st.invDiv]}>
                <View style={st.invIc}><MIcon name="check" size={16} color={ukColors.success} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: ukColors.text }}>{f.amount}</Text>
                  <Text style={{ fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>{f.date} · {f.desc}</Text>
                </View>
                <Badge tone="success" label={f.status} />
              </View>
            ))}
          </Card>
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
  hero: { backgroundColor: ukColors.primary, borderRadius: 24, padding: 18 },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 9, height: 24, borderRadius: 999 },
  heroBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  heroTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 12 },
  visa: { width: 46, height: 32, borderRadius: 8, backgroundColor: "#1a1f71", alignItems: "center", justifyContent: "center" },
  lightBtn: { height: 36, paddingHorizontal: 14, borderRadius: 12, backgroundColor: ukColors.surface3, alignItems: "center", justifyContent: "center" },
  lightBtnText: { fontSize: 13, fontWeight: "700", color: ukColors.text },
  invRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  invDiv: { borderBottomColor: ukColors.border, borderBottomWidth: 1 },
  invIc: { width: 34, height: 34, borderRadius: 10, backgroundColor: ukColors.successSoft, alignItems: "center", justifyContent: "center" },
});
