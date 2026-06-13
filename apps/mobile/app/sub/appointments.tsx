import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { ukColors, ukRadius, ukSpace } from "@/lib/theme";

type Appointment = {
  id: string;
  topic: string;
  status: string;
  scheduledAt?: string;
};

const APPT_TYPES = ["Yüz yüze", "Online", "Telefon"] as const;

export default function AppointmentsScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState<Appointment[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("Yüz yüze");

  useEffect(() => {
    if (!token) return;
    void apiFetch<{ appointments: Appointment[] }>("/api/student/appointments", { token })
      .then((res) => setItems(res.appointments))
      .catch(() => setItems([]));
  }, [token]);

  const statusLabel = (s: string) => {
    const map: Record<string, string> = { pending: "Bekliyor", confirmed: "Onaylandı", cancelled: "İptal" };
    return map[s] ?? s;
  };

  return (
    <>
      <Stack.Screen options={{ title: "Randevular" }} />
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        {items.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MIcon name="calendar" size={32} color={ukColors.faint} />
            <Text style={styles.emptyText}>Yaklaşan randevu yok.</Text>
          </View>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <MIcon name="calendar" size={20} color={ukColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.topic}</Text>
                <Text style={styles.cardMeta}>{statusLabel(item.status)}{item.scheduledAt ? ` · ${item.scheduledAt}` : ""}</Text>
              </View>
            </View>
          ))
        )}

        <Pressable style={styles.addBtn} onPress={() => setShowNew(true)}>
          <MIcon name="plus" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Randevu İste</Text>
        </Pressable>
      </ScrollView>

      {/* Yeni randevu sheet */}
      <Modal visible={showNew} transparent animationType="slide" onRequestClose={() => setShowNew(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowNew(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Yeni Randevu</Text>

          <Text style={styles.sheetLabel}>Görüşme türü</Text>
          <View style={styles.typeSeg}>
            {APPT_TYPES.map((t) => (
              <Pressable
                key={t}
                style={[styles.typeItem, selectedType === t && styles.typeItemActive]}
                onPress={() => setSelectedType(t)}
              >
                <Text style={[styles.typeText, selectedType === t && styles.typeTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sheetActions}>
            <Pressable style={styles.cancelBtn} onPress={() => setShowNew(false)}>
              <Text style={styles.cancelBtnText}>Vazgeç</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={() => setShowNew(false)}>
              <Text style={styles.saveBtnText}>İste</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
  content: { padding: ukSpace.lg, paddingBottom: 40 },
  emptyWrap: { alignItems: "center", gap: 10, padding: ukSpace.xl },
  emptyText: { color: ukColors.muted, fontWeight: "600" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    padding: ukSpace.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    marginBottom: 10,
  },
  cardLeft: {
    width: 40,
    height: 40,
    borderRadius: ukRadius.sm,
    backgroundColor: ukColors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: ukColors.text },
  cardMeta: { marginTop: 4, fontSize: 12, fontWeight: "600", color: ukColors.muted },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: ukColors.primary,
    borderRadius: ukRadius.md,
    minHeight: 48,
    marginTop: ukSpace.lg,
  },
  addBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    backgroundColor: ukColors.surface,
    borderTopLeftRadius: ukRadius.xl,
    borderTopRightRadius: ukRadius.xl,
    padding: ukSpace.lg,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: ukColors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 17, fontWeight: "800", color: ukColors.text, marginBottom: ukSpace.md },
  sheetLabel: { fontSize: 13, fontWeight: "700", color: ukColors.muted, marginBottom: 10 },
  typeSeg: { flexDirection: "row", gap: 8, marginBottom: ukSpace.lg },
  typeItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: ukRadius.sm,
    backgroundColor: ukColors.bg,
    borderWidth: 1,
    borderColor: ukColors.border,
  },
  typeItemActive: { backgroundColor: ukColors.primary, borderColor: ukColors.primary },
  typeText: { fontSize: 13, fontWeight: "700", color: ukColors.muted },
  typeTextActive: { color: "#fff" },
  sheetActions: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1,
    borderRadius: ukRadius.md,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ukColors.bg,
    borderWidth: 1,
    borderColor: ukColors.border,
  },
  cancelBtnText: { color: ukColors.muted, fontWeight: "700" },
  saveBtn: {
    flex: 2,
    borderRadius: ukRadius.md,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ukColors.primary,
  },
  saveBtnText: { color: "#fff", fontWeight: "800" },
});
