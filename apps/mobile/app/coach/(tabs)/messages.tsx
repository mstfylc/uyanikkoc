import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Badge, Card, PageTitle } from "@/components/parent-ui";
import { C_THREADS } from "@/lib/coach-data";
import { ukColors, ukSpace } from "@/lib/theme";

export default function CoachMessages() {
  const router = useRouter();
  const unread = C_THREADS.reduce((n, t) => n + t.unread, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 28 }}>
      <PageTitle title="Mesajlar" sub={`${C_THREADS.length} sohbet · ${unread} okunmamış`} />
      <View style={{ paddingHorizontal: ukSpace.lg, gap: 10 }}>
        {C_THREADS.map((t) => (
          <Pressable key={t.id} onPress={() => router.push({ pathname: "/coach/sub/thread", params: { id: t.id } })}>
            <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={st.avatar}><Text style={st.avatarText}>{t.initials}</Text></View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 14.5, fontWeight: "700", color: ukColors.text }}>{t.name}</Text>
                  <Badge label={t.kind} tone={t.kind === "Veli" ? "info" : "muted"} />
                </View>
                <Text numberOfLines={1} style={{ fontSize: 12.5, color: ukColors.muted, fontWeight: "500", marginTop: 3 }}>{t.last}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 5 }}>
                <Text style={{ fontSize: 11, color: ukColors.faint, fontWeight: "600" }}>{t.time}</Text>
                {t.unread > 0 ? <View style={st.unread}><Text style={st.unreadText}>{t.unread}</Text></View> : null}
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  avatar: { width: 46, height: 46, borderRadius: 14, backgroundColor: ukColors.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  unread: { minWidth: 20, height: 20, borderRadius: 999, backgroundColor: ukColors.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  unreadText: { color: "#fff", fontSize: 11, fontWeight: "800" },
});
