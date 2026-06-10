import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { Card, SectionHead } from "@/components/parent-ui";
import { useAuth } from "@/lib/auth";
import { C_COACH } from "@/lib/coach-data";
import { ukColors, ukSpace } from "@/lib/theme";

export default function CoachProfile() {
  const router = useRouter();
  const { logout } = useAuth();
  const [notif, setNotif] = useState(true);
  const [dark, setDark] = useState(false);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 16, paddingBottom: 28 }}>
      <View style={{ alignItems: "center", paddingHorizontal: ukSpace.lg }}>
        <View style={st.bigAvatar}><Text style={{ color: "#fff", fontWeight: "800", fontSize: 26 }}>{C_COACH.initials}</Text></View>
        <Text style={{ fontSize: 20, fontWeight: "800", color: ukColors.text, marginTop: 12 }}>{C_COACH.name}</Text>
        <Text style={{ fontSize: 13, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>{C_COACH.title}</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: ukSpace.lg, marginTop: 18 }}>
        {[
          { ic: "users", val: C_COACH.studentCount, lab: "Öğrenci" },
          { ic: "star", val: C_COACH.rating, lab: "Puan" },
          { ic: "award", val: `${C_COACH.yearsExp} yıl`, lab: "Deneyim" },
        ].map((s) => (
          <Card key={s.lab} style={{ flex: 1, alignItems: "center" }}>
            <MIcon name={s.ic} size={20} color={ukColors.primary} />
            <Text style={{ fontSize: 18, fontWeight: "800", color: ukColors.text, marginTop: 6 }}>{s.val}</Text>
            <Text style={{ fontSize: 11.5, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>{s.lab}</Text>
          </Card>
        ))}
      </View>

      <View style={{ marginTop: 22 }}>
        <SectionHead title="İletişim" />
        <View style={{ paddingHorizontal: ukSpace.lg }}>
          <Card style={{ padding: 0 }}>
            <View style={st.row}><View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}><MIcon name="phone" size={18} color={ukColors.text} /><Text style={st.rowLabel}>{C_COACH.phone}</Text></View></View>
            <View style={st.div} />
            <View style={st.row}><View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}><MIcon name="mail" size={18} color={ukColors.text} /><Text style={st.rowLabel}>{C_COACH.email}</Text></View></View>
          </Card>
        </View>
      </View>

      <View style={{ marginTop: 22 }}>
        <SectionHead title="Tercihler" />
        <View style={{ paddingHorizontal: ukSpace.lg }}>
          <Card style={{ padding: 0 }}>
            <View style={st.row}><View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}><MIcon name="bell" size={19} color={ukColors.text} /><Text style={st.rowLabel}>Bildirimler</Text></View><Switch value={notif} onValueChange={setNotif} trackColor={{ true: ukColors.primary }} /></View>
            <View style={st.div} />
            <View style={st.row}><View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}><MIcon name="moon" size={19} color={ukColors.text} /><Text style={st.rowLabel}>Koyu tema</Text></View><Switch value={dark} onValueChange={setDark} trackColor={{ true: ukColors.primary }} /></View>
          </Card>
        </View>
      </View>

      <View style={{ paddingHorizontal: ukSpace.lg, marginTop: 22 }}>
        <Pressable style={st.logout} onPress={() => { void logout(); router.replace("/login"); }}>
          <MIcon name="logout" size={18} color={ukColors.danger} />
          <Text style={{ fontSize: 14.5, fontWeight: "700", color: ukColors.danger }}>Çıkış yap</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  bigAvatar: { width: 84, height: 84, borderRadius: 26, backgroundColor: ukColors.primary, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  rowLabel: { fontSize: 14, fontWeight: "600", color: ukColors.text },
  div: { height: 1, backgroundColor: ukColors.border, marginHorizontal: 16 },
  logout: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 15, backgroundColor: ukColors.dangerSoft },
});
