import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { Badge, Card, SectionHead } from "@/components/parent-ui";
import { Chips, Sheet, SheetField } from "@/components/Sheet";
import { useParent } from "@/lib/parent-context";
import { ukColors, ukSpace } from "@/lib/theme";

const MODES = ["Yüz yüze", "Online", "Telefon"] as const;
const SLOTS = ["10:00", "14:00", "16:30", "18:00", "20:00"] as const;

type Request = { id: string; mode: string; slot: string };

export default function ParentAppointments() {
  const router = useRouter();
  const { child } = useParent();
  const u = child.upcoming;
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<(typeof MODES)[number]>("Yüz yüze");
  const [slot, setSlot] = useState<(typeof SLOTS)[number]>("16:30");
  const [requests, setRequests] = useState<Request[]>([]);

  const submit = () => {
    setRequests((r) => [{ id: `req-${Date.now()}`, mode, slot }, ...r]);
    setOpen(false);
    Alert.alert("Randevu talebi gönderildi", `${child.coach} ile ${mode.toLowerCase()} · ${slot} talebiniz iletildi.`);
  };

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

      {requests.length > 0 ? (
        <View style={{ marginTop: 18 }}>
          <SectionHead title="Taleplerim" />
          <View style={{ paddingHorizontal: ukSpace.lg, gap: 10 }}>
            {requests.map((r) => (
              <Card key={r.id} style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
                <View style={st.ic}><MIcon name="clock" size={20} color={ukColors.warning} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: ukColors.text }}>{r.mode} görüşme</Text>
                  <Text style={{ fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>Tercih: {r.slot}</Text>
                </View>
                <Badge tone="warning" label="Bekliyor" />
              </Card>
            ))}
          </View>
        </View>
      ) : null}

      <View style={{ paddingHorizontal: ukSpace.lg, marginTop: 18 }}>
        <Pressable style={st.primaryBtn} onPress={() => setOpen(true)}><MIcon name="plus" size={17} color="#fff" /><Text style={st.primaryBtnText}>Yeni randevu talep et</Text></Pressable>
      </View>

      <Sheet
        open={open}
        title="Randevu talebi"
        sub={`${child.coach} ile görüşme`}
        onClose={() => setOpen(false)}
        footer={<Pressable style={st.primaryBtn} onPress={submit}><MIcon name="check" size={17} color="#fff" /><Text style={st.primaryBtnText}>Talep gönder</Text></Pressable>}
      >
        <SheetField label="Görüşme türü"><Chips options={MODES} value={mode} onChange={setMode} /></SheetField>
        <SheetField label="Tercih edilen saat"><Chips options={SLOTS} value={slot} onChange={setSlot} /></SheetField>
      </Sheet>
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
