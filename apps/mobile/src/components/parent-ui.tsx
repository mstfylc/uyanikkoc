// Veli ekranları için paylaşılan RN bileşenleri (kaynak uk-parent.jsx port).
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { MIcon } from "@/components/MIcon";
import { useParent } from "@/lib/parent-context";
import { subjectColor, ukColors, ukRadius, ukSpace } from "@/lib/theme";
import type { ParentChild, ParentOdev } from "@/lib/parent-data";
import { mNet } from "@/lib/parent-data";

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View style={s.secHead}>
      <Text style={s.secTitle}>{title}</Text>
      {action}
    </View>
  );
}

export function Badge({ label, tone = "muted", icon }: { label: string; tone?: "primary" | "success" | "warning" | "danger" | "info" | "muted"; icon?: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    primary: { bg: ukColors.primarySoft, fg: ukColors.primary600 },
    success: { bg: ukColors.successSoft, fg: ukColors.success },
    warning: { bg: ukColors.warningSoft, fg: ukColors.warning },
    danger: { bg: ukColors.dangerSoft, fg: ukColors.danger },
    info: { bg: ukColors.infoSoft, fg: ukColors.info },
    muted: { bg: ukColors.surface, fg: ukColors.muted },
  };
  const c = map[tone];
  return (
    <View style={[s.badge, { backgroundColor: c.bg }]}>
      {icon ? <MIcon name={icon} size={12} color={c.fg} /> : null}
      <Text style={[s.badgeText, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={{ paddingHorizontal: ukSpace.lg, paddingTop: 6, paddingBottom: 10 }}>
      <Text style={s.h1}>{title}</Text>
      {sub ? <Text style={s.h1sub}>{sub}</Text> : null}
    </View>
  );
}

export function POdevCard({ o }: { o: ParentOdev }) {
  const c = subjectColor(o.subject);
  const done = o.status === "done";
  return (
    <Card style={{ marginHorizontal: ukSpace.lg, marginBottom: 10, flexDirection: "row", gap: 12, alignItems: "flex-start", opacity: done ? 0.85 : 1 }}>
      <View style={[s.odevIc, { backgroundColor: c + "22" }]}>
        <MIcon name="book" size={20} color={c} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.odevTitle}>{o.topic}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
          <View style={s.chip}><View style={[s.sw, { backgroundColor: c }]} /><Text style={s.chipText}>{o.subject}</Text></View>
          {o.count ? <Text style={s.meta}>{o.count} soru</Text> : null}
        </View>
        {done && o.result ? (
          <View style={{ flexDirection: "row", gap: 12, marginTop: 8, alignItems: "center" }}>
            <Text style={{ color: ukColors.success, fontWeight: "700", fontSize: 13 }}>✓ {o.result.d}</Text>
            <Text style={{ color: ukColors.danger, fontWeight: "700", fontSize: 13 }}>✕ {o.result.y}</Text>
            <Text style={{ color: ukColors.muted, fontWeight: "700", fontSize: 13 }}>○ {o.result.b}</Text>
            <Badge tone="primary" label={`net ${mNet(o.result.d, o.result.y)}`} />
          </View>
        ) : null}
        <View style={{ marginTop: 10, flexDirection: "row" }}>
          {done ? (
            <Badge tone="success" icon="check" label="Tamamlandı" />
          ) : (
            <Badge tone="warning" icon="clock" label={`Bekliyor · ${new Date(o.due).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}`} />
          )}
        </View>
      </View>
    </Card>
  );
}

export function ChildSwitcher() {
  const { child, children, setChildId } = useParent();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ paddingHorizontal: ukSpace.lg }}>
      <Pressable style={s.switcher} onPress={() => setOpen(true)}>
        <View style={s.avatarSm}><Text style={s.avatarSmText}>{child.initials}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.switchLabel}>İzlenen öğrenci</Text>
          <Text style={s.switchName}>{child.name}</Text>
        </View>
        <Badge label={child.grade.split(" · ")[0]} />
        <MIcon name="chevronDown" size={18} color={ukColors.faint} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.overlay} onPress={() => setOpen(false)}>
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.grip} />
            <Text style={s.sheetTitle}>Öğrenci seç</Text>
            {children.map((c: ParentChild) => {
              const on = c.id === child.id;
              return (
                <Pressable key={c.id} onPress={() => { setChildId(c.id); setOpen(false); }} style={[s.childRow, { borderColor: on ? ukColors.primary : ukColors.border, backgroundColor: on ? ukColors.primarySoft : ukColors.surface }]}>
                  <View style={s.avatarSm}><Text style={s.avatarSmText}>{c.initials}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: ukColors.text }}>{c.name}</Text>
                    <Text style={s.meta}>{c.grade} · Koç: {c.coach}</Text>
                  </View>
                  {on ? <MIcon name="checkCircle" size={22} color={ukColors.primary} /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export const s = StyleSheet.create({
  card: { backgroundColor: ukColors.surface, borderColor: ukColors.border, borderWidth: 1, borderRadius: ukRadius.lg, padding: 16 },
  secHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: ukSpace.lg, marginBottom: 10 },
  secTitle: { fontSize: 16, fontWeight: "800", color: ukColors.text, letterSpacing: -0.3 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, height: 23, borderRadius: 999 },
  badgeText: { fontSize: 11.5, fontWeight: "700" },
  h1: { fontSize: 26, fontWeight: "800", color: ukColors.text, letterSpacing: -0.6 },
  h1sub: { fontSize: 13, fontWeight: "600", color: ukColors.muted, marginTop: 3 },
  odevIc: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  odevTitle: { fontSize: 14.5, fontWeight: "700", color: ukColors.text },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: ukColors.surface, borderColor: ukColors.border, borderWidth: 1, paddingHorizontal: 8, height: 22, borderRadius: 999 },
  chipText: { fontSize: 11.5, fontWeight: "600", color: ukColors.text },
  sw: { width: 8, height: 8, borderRadius: 999 },
  meta: { fontSize: 11.5, fontWeight: "600", color: ukColors.muted },
  switcher: { flexDirection: "row", alignItems: "center", gap: 11, padding: 12, backgroundColor: ukColors.surface, borderColor: ukColors.border, borderWidth: 1, borderRadius: 14 },
  avatarSm: { width: 40, height: 40, borderRadius: 12, backgroundColor: ukColors.primary, alignItems: "center", justifyContent: "center" },
  avatarSmText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  switchLabel: { fontSize: 11, fontWeight: "700", color: ukColors.muted },
  switchName: { fontSize: 15, fontWeight: "800", color: ukColors.text },
  overlay: { flex: 1, backgroundColor: "rgba(11,14,24,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: ukColors.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 34, gap: 8 },
  grip: { width: 40, height: 4, borderRadius: 999, backgroundColor: ukColors.border, alignSelf: "center", marginBottom: 10 },
  sheetTitle: { fontSize: 16, fontWeight: "800", color: ukColors.text, marginBottom: 6 },
  childRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderWidth: 1, borderRadius: 16 },
});
