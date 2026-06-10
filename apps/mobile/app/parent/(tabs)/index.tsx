import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { MIcon } from "@/components/MIcon";
import { Card, ChildSwitcher, POdevCard, SectionHead } from "@/components/parent-ui";
import { Sheet } from "@/components/Sheet";
import { useParent } from "@/lib/parent-context";
import { P_PARENT } from "@/lib/parent-data";
import { ukColors, ukRadius, ukSpace } from "@/lib/theme";

const QUICK: { key: string; icon: string; label: string; tone: keyof typeof TONES; href: string }[] = [
  { key: "raporlar", icon: "shield", label: "Raporlar", tone: "primary", href: "/parent/reports" },
  { key: "mesaj", icon: "message", label: "Koça Mesaj", tone: "warning", href: "/parent/sub/messages" },
  { key: "randevu", icon: "calendar", label: "Randevu", tone: "success", href: "/parent/sub/appointments" },
  { key: "odeme", icon: "card", label: "Ödeme", tone: "info", href: "/parent/sub/payment" },
  { key: "odevler", icon: "clipboard", label: "Ödevler", tone: "primary", href: "/parent/assignments" },
  { key: "denemeler", icon: "chart", label: "Denemeler", tone: "danger", href: "/parent/exams" },
];

const TONES = {
  primary: { bg: ukColors.primarySoft, fg: ukColors.primary600 },
  warning: { bg: ukColors.warningSoft, fg: ukColors.warning },
  success: { bg: ukColors.successSoft, fg: ukColors.success },
  info: { bg: ukColors.infoSoft, fg: ukColors.info },
  danger: { bg: ukColors.dangerSoft, fg: ukColors.danger },
} as const;

export default function ParentHome() {
  const router = useRouter();
  const { child } = useParent();
  const [notifOpen, setNotifOpen] = useState(false);
  const pending = child.odev.filter((o) => o.status !== "done");
  const doneCount = child.odev.length - pending.length;
  const pct = child.odev.length ? Math.round((doneCount / child.odev.length) * 100) : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 14, paddingBottom: 28 }}>
      <View style={st.head}>
        <View style={st.avatar}><Text style={st.avatarText}>{P_PARENT.initials}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={st.hi}>Merhaba,</Text>
          <Text style={st.name}>{P_PARENT.name}</Text>
        </View>
        <Pressable style={st.iconBtn} onPress={() => setNotifOpen(true)}><MIcon name="bell" size={20} color={ukColors.text} /></Pressable>
      </View>

      <Sheet open={notifOpen} title="Bildirimler" sub={child.name} onClose={() => setNotifOpen(false)}>
        {[
          child.reports.some((r) => r.status === "yeni") ? { ic: "shield", tone: ukColors.primary600, t: "Yeni gelişim raporu", d: "Koçun haftalık değerlendirmesi hazır" } : null,
          pending.length > 0 ? { ic: "clock", tone: ukColors.warning, t: `${pending.length} bekleyen ödev`, d: `${child.name.split(" ")[0]} bu hafta ${pending.length} ödev tamamlamalı` } : null,
          child.exams[0] ? { ic: "chart", tone: ukColors.success, t: "Son deneme sonucu", d: `${child.exams[0].name} · net ${child.exams[0].net}` } : null,
        ].filter(Boolean).map((n, i) => {
          const item = n as { ic: string; tone: string; t: string; d: string };
          return (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={[st.notifIc, { backgroundColor: item.tone + "22" }]}><MIcon name={item.ic} size={16} color={item.tone} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13.5, fontWeight: "700", color: ukColors.text }}>{item.t}</Text>
                <Text style={{ fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 1 }}>{item.d}</Text>
              </View>
            </View>
          );
        })}
      </Sheet>

      <View style={{ marginTop: 4 }}><ChildSwitcher /></View>

      <View style={{ paddingHorizontal: ukSpace.lg, marginTop: 14 }}>
        <View style={st.hero}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={st.heroBadge}><MIcon name="flame" size={13} color="#fff" fill /><Text style={st.heroBadgeText}>{child.streak} gün seri</Text></View>
            <Text style={st.heroGoal}>{child.goal}</Text>
          </View>
          <Text style={st.heroTitle}>{child.name.split(" ")[0]} bu hafta %{child.completion} tamamladı</Text>
          <Text style={st.heroSub}>{doneCount} ödev bitti · {pending.length} bekliyor · {child.weekHours} saat çalışma</Text>
          <View style={st.heroBar}><View style={[st.heroFill, { width: `${pct}%` }]} /></View>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: ukSpace.lg, marginTop: 16 }}>
        <Card style={{ flex: 1 }}>
          <View style={st.statLab}><View style={[st.statIc, { backgroundColor: ukColors.primarySoft }]}><MIcon name="chart" size={15} color={ukColors.primary600} /></View><Text style={st.statLabText}>Toplam Net</Text></View>
          <Text style={st.statVal}>{child.net}</Text>
          <Text style={{ color: ukColors.success, fontSize: 12, fontWeight: "600", marginTop: 2 }}>▲ son denemede artış</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <View style={st.statLab}><View style={[st.statIc, { backgroundColor: ukColors.infoSoft }]}><MIcon name="clock" size={15} color={ukColors.info} /></View><Text style={st.statLabText}>Bu hafta</Text></View>
          <Text style={st.statVal}>{child.weekHours}<Text style={{ fontSize: 15, color: ukColors.muted }}> sa</Text></Text>
          <Text style={{ color: ukColors.muted, fontSize: 12, fontWeight: "600", marginTop: 2 }}>çalışma süresi</Text>
        </Card>
      </View>

      <View style={{ marginTop: 22 }}>
        <SectionHead title="Hızlı erişim" />
        <View style={st.qaGrid}>
          {QUICK.map((q) => {
            const t = TONES[q.tone];
            return (
              <Pressable key={q.key} style={st.qaItem} onPress={() => router.push(q.href as never)}>
                <View style={[st.qaIc, { backgroundColor: t.bg }]}><MIcon name={q.icon} size={21} color={t.fg} /></View>
                <Text style={st.qaLabel}>{q.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ marginTop: 22 }}>
        <SectionHead title="Bugünün ödevleri" action={<Pressable onPress={() => router.push("/parent/assignments")}><Text style={st.more}>Tümü ›</Text></Pressable>} />
        {pending.slice(0, 2).map((o) => <POdevCard key={o.id} o={o} />)}
      </View>

      <View style={{ paddingHorizontal: ukSpace.lg, marginTop: 22 }}>
        <Card style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
          <View style={[st.avatar, { width: 48, height: 48 }]}><Text style={st.avatarText}>{child.coachInitials}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14.5, fontWeight: "800", color: ukColors.text }}>{child.coach}</Text>
            <Text style={st.more2}>{child.name.split(" ")[0]} — Koçu</Text>
          </View>
          <Pressable style={[st.iconBtn, { backgroundColor: ukColors.primary }]} onPress={() => router.push("/parent/sub/messages")}>
            <MIcon name="message" size={19} color="#fff" />
          </Pressable>
        </Card>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: ukSpace.lg },
  avatar: { width: 46, height: 46, borderRadius: 14, backgroundColor: ukColors.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  hi: { fontSize: 13, color: ukColors.muted, fontWeight: "600" },
  name: { fontSize: 19, fontWeight: "800", color: ukColors.text, letterSpacing: -0.4 },
  iconBtn: { width: 44, height: 44, borderRadius: 13, backgroundColor: ukColors.surface, borderColor: ukColors.border, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  hero: { backgroundColor: ukColors.primary, borderRadius: ukRadius.xl, padding: 18 },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 9, height: 24, borderRadius: 999 },
  heroBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  heroGoal: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "700" },
  heroTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 14, letterSpacing: -0.4 },
  heroSub: { color: "rgba(255,255,255,0.88)", fontSize: 13, fontWeight: "500", marginTop: 6 },
  heroBar: { height: 7, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.22)", marginTop: 14, overflow: "hidden" },
  heroFill: { height: 7, borderRadius: 999, backgroundColor: "#fff" },
  statLab: { flexDirection: "row", alignItems: "center", gap: 7 },
  statIc: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  statLabText: { fontSize: 12.5, fontWeight: "700", color: ukColors.muted },
  statVal: { fontSize: 26, fontWeight: "800", color: ukColors.text, marginTop: 8, letterSpacing: -0.5 },
  qaGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: ukSpace.lg - 6, gap: 0 },
  qaItem: { width: "33.33%", alignItems: "center", paddingVertical: 10 },
  qaIc: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  qaLabel: { fontSize: 12, fontWeight: "700", color: ukColors.text, marginTop: 7 },
  more: { fontSize: 12.5, fontWeight: "700", color: ukColors.primary600 },
  more2: { fontSize: 12.5, fontWeight: "600", color: ukColors.muted, marginTop: 2 },
  notifIc: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
