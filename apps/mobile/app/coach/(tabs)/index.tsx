import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { Badge, Card, SectionHead } from "@/components/parent-ui";
import { C_ACTIVITY, C_APPTS, C_COACH, C_REVIEWS, C_STUDENTS, C_THREADS, C_TODAY } from "@/lib/coach-data";
import { ukColors, ukRadius, ukSpace } from "@/lib/theme";

const QUICK = [
  { key: "duyuru", icon: "send", label: "Duyuru", bg: ukColors.primarySoft, fg: ukColors.primary600, href: "/coach/sub/announcement" },
  { key: "gorevler", icon: "checkCircle", label: "Görevler", bg: ukColors.successSoft, fg: ukColors.success, href: "/coach/sub/tasks" },
  { key: "deneme", icon: "chart", label: "Deneme ata", bg: ukColors.infoSoft, fg: ukColors.info, href: "/coach/sub/exam" },
];

export default function CoachToday() {
  const router = useRouter();
  const [reviews, setReviews] = useState(C_REVIEWS);
  const todayAppts = C_APPTS.filter((a) => a.day === C_TODAY);
  const active = C_STUDENTS.filter((s) => s.status !== "new");
  const riskCount = C_STUDENTS.filter((s) => s.status === "risk").length;
  const avgComp = Math.round(active.reduce((n, s) => n + s.completion, 0) / active.length);
  const unread = C_THREADS.reduce((n, t) => n + t.unread, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 14, paddingBottom: 28 }}>
      <View style={st.head}>
        <View style={st.avatar}><Text style={st.avatarText}>{C_COACH.initials}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={st.hi}>Günaydın,</Text>
          <Text style={st.name}>{C_COACH.name}</Text>
        </View>
        <Pressable style={st.iconBtn}><MIcon name="bell" size={20} color={ukColors.text} /></Pressable>
      </View>

      <View style={{ paddingHorizontal: ukSpace.lg, marginTop: 4 }}>
        <View style={st.hero}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={st.heroBadge}><MIcon name="calendar" size={13} color="#fff" /><Text style={st.heroBadgeText}>6 Haziran Cumartesi</Text></View>
            <Text style={st.heroGoal}>{C_COACH.studentCount} öğrenci</Text>
          </View>
          <Text style={st.heroTitle}>Bugün {todayAppts.length} randevun var</Text>
          <Text style={st.heroSub}>{reviews.length} ödev incelemeni bekliyor · {unread} okunmamış mesaj</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: ukSpace.lg - 6, marginTop: 14 }}>
        {[
          { ic: "users", bg: ukColors.primarySoft, fg: ukColors.primary600, val: active.length, lab: "Aktif öğrenci", sub: `${C_STUDENTS.length - active.length} yeni atanan`, onPress: () => router.push("/coach/students") },
          { ic: "shield", bg: ukColors.dangerSoft, fg: ukColors.danger, val: riskCount, lab: "Risk altında", sub: "takip gerekiyor", valColor: ukColors.danger, onPress: () => router.push("/coach/students") },
          { ic: "checkCircle", bg: ukColors.successSoft, fg: ukColors.success, val: `%${avgComp}`, lab: "Ort. tamamlama", sub: "bu hafta" },
          { ic: "calendar", bg: ukColors.infoSoft, fg: ukColors.info, val: todayAppts.length, lab: "Bugün randevu", sub: "sonraki 11:00" },
        ].map((s, i) => (
          <View key={i} style={{ width: "50%", padding: 6 }}>
            <Pressable style={st.statCard} onPress={s.onPress}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}><View style={[st.statIc, { backgroundColor: s.bg }]}><MIcon name={s.ic} size={15} color={s.fg} /></View><Text style={st.statLab}>{s.lab}</Text></View>
              <Text style={[st.statVal, s.valColor ? { color: s.valColor } : null]}>{s.val}</Text>
              <Text style={st.statSub}>{s.sub}</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 16 }}>
        <SectionHead title="Hızlı erişim" />
        <View style={{ flexDirection: "row", paddingHorizontal: ukSpace.lg, gap: 10 }}>
          {QUICK.map((q) => (
            <Pressable key={q.key} style={st.qaItem} onPress={() => router.push(q.href as never)}>
              <View style={[st.qaIc, { backgroundColor: q.bg }]}><MIcon name={q.icon} size={21} color={q.fg} /></View>
              <Text style={st.qaLabel}>{q.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ marginTop: 22 }}>
        <SectionHead title={`İnceleme kuyruğu · ${reviews.length}`} />
        {reviews.length === 0 ? (
          <View style={{ paddingHorizontal: ukSpace.lg }}><Card><Text style={{ color: ukColors.muted, fontSize: 13 }}>Bekleyen inceleme yok 🎉</Text></Card></View>
        ) : reviews.map((r) => (
          <Card key={r.id} style={{ marginHorizontal: ukSpace.lg, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={st.miniAv}><Text style={st.miniAvText}>{r.initials}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: ukColors.text }}>{r.student}</Text>
              <Text style={{ fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>{r.subject} · {r.topic}</Text>
              {r.result ? <Text style={{ fontSize: 12, color: ukColors.muted, marginTop: 3 }}>D {r.result.d} · Y {r.result.y} · B {r.result.b}</Text> : null}
            </View>
            <Pressable style={st.approve} onPress={() => setReviews((rs) => rs.filter((x) => x.id !== r.id))}><MIcon name="check" size={16} color="#fff" /></Pressable>
          </Card>
        ))}
      </View>

      <View style={{ marginTop: 22 }}>
        <SectionHead title="Bugünün randevuları" />
        {todayAppts.map((a) => (
          <Pressable key={a.id} onPress={() => router.push({ pathname: "/coach/sub/student", params: { id: a.sid } })}>
            <Card style={{ marginHorizontal: ukSpace.lg, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={st.timeBox}><Text style={st.timeText}>{a.time}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: ukColors.text }}>{a.student}</Text>
                <Text style={{ fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>{a.topic}</Text>
              </View>
              <Badge label={a.mode} tone={a.mode === "Online" ? "info" : a.mode === "Telefon" ? "warning" : "success"} />
            </Card>
          </Pressable>
        ))}
      </View>

      <View style={{ marginTop: 22 }}>
        <SectionHead title="Bugünün hareketleri" />
        <View style={{ paddingHorizontal: ukSpace.lg }}>
          <Card style={{ padding: 0 }}>
            {C_ACTIVITY.map((a, i) => {
              const tone: Record<string, string> = { success: ukColors.success, primary: ukColors.primary600, warning: ukColors.warning, danger: ukColors.danger, info: ukColors.info };
              return (
                <View key={i} style={[st.actRow, i < C_ACTIVITY.length - 1 && st.actDiv]}>
                  <View style={[st.actIc, { backgroundColor: (tone[a.tone] ?? ukColors.muted) + "22" }]}><MIcon name={a.icon} size={16} color={tone[a.tone] ?? ukColors.muted} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13.5, fontWeight: "700", color: ukColors.text }}>{a.who}</Text>
                    <Text style={{ fontSize: 12, color: ukColors.muted, fontWeight: "600", marginTop: 1 }}>{a.what}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: ukColors.faint, fontWeight: "600" }}>{a.time}</Text>
                </View>
              );
            })}
          </Card>
        </View>
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
  statCard: { backgroundColor: ukColors.surface, borderColor: ukColors.border, borderWidth: 1, borderRadius: ukRadius.lg, padding: 14 },
  statIc: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  statLab: { fontSize: 12, fontWeight: "700", color: ukColors.muted },
  statVal: { fontSize: 24, fontWeight: "800", color: ukColors.text, marginTop: 8 },
  statSub: { fontSize: 11.5, color: ukColors.muted, fontWeight: "600", marginTop: 2 },
  qaItem: { flex: 1, alignItems: "center", paddingVertical: 6 },
  qaIc: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  qaLabel: { fontSize: 12, fontWeight: "700", color: ukColors.text, marginTop: 7 },
  miniAv: { width: 40, height: 40, borderRadius: 12, backgroundColor: ukColors.primary, alignItems: "center", justifyContent: "center" },
  miniAvText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  approve: { width: 38, height: 38, borderRadius: 11, backgroundColor: ukColors.success, alignItems: "center", justifyContent: "center" },
  timeBox: { width: 56, height: 44, borderRadius: 12, backgroundColor: ukColors.primarySoft, alignItems: "center", justifyContent: "center" },
  timeText: { fontSize: 13, fontWeight: "800", color: ukColors.primary600 },
  actRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  actDiv: { borderBottomColor: ukColors.border, borderBottomWidth: 1 },
  actIc: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
