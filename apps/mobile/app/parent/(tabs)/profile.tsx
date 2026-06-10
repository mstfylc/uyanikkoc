import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { Card, SectionHead } from "@/components/parent-ui";
import { useAuth } from "@/lib/auth";
import { useParent } from "@/lib/parent-context";
import { P_PARENT } from "@/lib/parent-data";
import { ukColors, ukSpace } from "@/lib/theme";

export default function ParentProfile() {
  const router = useRouter();
  const { logout } = useAuth();
  const { child, children, setChildId } = useParent();
  const [notif, setNotif] = useState(true);
  const [dark, setDark] = useState(false);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 16, paddingBottom: 28 }}>
      <View style={{ alignItems: "center", paddingHorizontal: ukSpace.lg }}>
        <View style={st.bigAvatar}><Text style={{ color: "#fff", fontWeight: "800", fontSize: 26 }}>{P_PARENT.initials}</Text></View>
        <Text style={{ fontSize: 20, fontWeight: "800", color: ukColors.text, marginTop: 12 }}>{P_PARENT.name}</Text>
        <Text style={{ fontSize: 13, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>Veli · {P_PARENT.phone}</Text>
      </View>

      <View style={{ marginTop: 22 }}>
        <SectionHead title="Çocuklarım" />
        <View style={{ paddingHorizontal: ukSpace.lg, gap: 10 }}>
          {children.map((c) => {
            const on = c.id === child.id;
            return (
              <Pressable key={c.id} onPress={() => setChildId(c.id)}>
                <Card style={{ flexDirection: "row", alignItems: "center", gap: 12, borderColor: on ? ukColors.primary : ukColors.border }}>
                  <View style={st.avatar}><Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>{c.initials}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: ukColors.text }}>{c.name}</Text>
                    <Text style={{ fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>{c.grade} · Koç: {c.coach}</Text>
                  </View>
                  {on ? <MIcon name="checkCircle" size={22} color={ukColors.primary} /> : null}
                </Card>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ marginTop: 22 }}>
        <SectionHead title="Tercihler" />
        <View style={{ paddingHorizontal: ukSpace.lg }}>
          <Card style={{ padding: 0 }}>
            <View style={st.row}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}><MIcon name="bell" size={19} color={ukColors.text} /><Text style={st.rowLabel}>Bildirimler</Text></View>
              <Switch value={notif} onValueChange={setNotif} trackColor={{ true: ukColors.primary }} />
            </View>
            <View style={st.div} />
            <View style={st.row}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}><MIcon name="moon" size={19} color={ukColors.text} /><Text style={st.rowLabel}>Koyu tema</Text></View>
              <Switch value={dark} onValueChange={setDark} trackColor={{ true: ukColors.primary }} />
            </View>
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
  avatar: { width: 44, height: 44, borderRadius: 13, backgroundColor: ukColors.primary, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  rowLabel: { fontSize: 14.5, fontWeight: "600", color: ukColors.text },
  div: { height: 1, backgroundColor: ukColors.border, marginHorizontal: 16 },
  logout: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 15, backgroundColor: ukColors.dangerSoft },
});
