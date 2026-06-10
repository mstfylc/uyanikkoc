// Yeniden kullanılabilir alt sayfa (bottom sheet) — mobil formlar/aksiyonlar için.
import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { MIcon } from "@/components/MIcon";
import { ukColors } from "@/lib/theme";

export function Sheet({
  open,
  title,
  sub,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  sub?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={st.overlay} onPress={onClose}>
        <Pressable style={st.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={st.grip} />
          <View style={st.head}>
            <View style={{ flex: 1 }}>
              <Text style={st.title}>{title}</Text>
              {sub ? <Text style={st.sub}>{sub}</Text> : null}
            </View>
            <Pressable style={st.close} onPress={onClose} hitSlop={8}>
              <View style={{ transform: [{ rotate: "45deg" }] }}>
                <MIcon name="plus" size={18} color={ukColors.muted} />
              </View>
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 460 }} contentContainerStyle={{ gap: 12, paddingBottom: 4 }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer ? <View style={{ marginTop: 14 }}>{footer}</View> : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function SheetField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={st.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function Chips<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable key={o} onPress={() => onChange(o)} style={[st.chip, on && st.chipOn]}>
            <Text style={[st.chipText, on && { color: "#fff" }]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const st = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(11,14,24,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: ukColors.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 34 },
  grip: { width: 40, height: 4, borderRadius: 999, backgroundColor: ukColors.border, alignSelf: "center", marginBottom: 12 },
  head: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  title: { fontSize: 17, fontWeight: "800", color: ukColors.text },
  sub: { fontSize: 12.5, color: ukColors.muted, fontWeight: "600", marginTop: 2 },
  close: { width: 32, height: 32, borderRadius: 10, backgroundColor: ukColors.surface3, alignItems: "center", justifyContent: "center" },
  fieldLabel: { fontSize: 11.5, fontWeight: "700", color: ukColors.muted },
  chip: { paddingHorizontal: 12, height: 34, borderRadius: 999, backgroundColor: ukColors.surface3, alignItems: "center", justifyContent: "center" },
  chipOn: { backgroundColor: ukColors.primary },
  chipText: { fontSize: 12.5, fontWeight: "700", color: ukColors.text },
});

export const sheetStyles = st;
