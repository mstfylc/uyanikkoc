import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { subjectColor, ukColors, ukRadius, ukSpace } from "@/lib/theme";

type Assignment = {
  id: string;
  title: string;
  status: string;
  completed: boolean;
  subject: string | null;
  dueDate: string | null;
};

type ResultState = { correct: string; wrong: string; empty: string };

const VIEWS = ["Günlük plan", "Liste", "Takvim"] as const;
type ViewType = (typeof VIEWS)[number];

function computeNet(correct: string, wrong: string): string {
  const d = parseFloat(correct) || 0;
  const y = parseFloat(wrong) || 0;
  return Math.max(0, d - y / 4).toFixed(2);
}

function weekLabel(offset: number): string {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d: Date) => `${d.getDate()} ${["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"][d.getMonth()]}`;
  return offset === 0 ? "Bu hafta" : `${fmt(start)} – ${fmt(end)}`;
}

export default function AssignmentsTab() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [view, setView] = useState<ViewType>("Günlük plan");
  const [weekOffset, setWeekOffset] = useState(0);
  const [resultSheet, setResultSheet] = useState<{ item: Assignment; data: ResultState } | null>(null);

  useEffect(() => {
    if (!token) return;
    void apiFetch<{ assignments: Assignment[] }>("/api/student/assignments", { token })
      .then((res) => setAssignments(res.assignments))
      .catch(() => setAssignments([]));
  }, [token]);

  const pending = useMemo(() => assignments.filter((a) => !a.completed), [assignments]);
  const done = useMemo(() => assignments.filter((a) => a.completed), [assignments]);

  function openResult(item: Assignment) {
    setResultSheet({ item, data: { correct: "", wrong: "", empty: "" } });
  }
  function closeResult() { setResultSheet(null); }
  function updateResult(field: keyof ResultState, val: string) {
    if (!resultSheet) return;
    setResultSheet({ ...resultSheet, data: { ...resultSheet.data, [field]: val } });
  }

  async function saveResult() {
    if (!resultSheet || !token) return;
    try {
      await apiFetch(`/api/student/assignments/${resultSheet.item.id}/result`, {
        token,
        method: "PATCH",
        body: JSON.stringify({
          correct: parseInt(resultSheet.data.correct) || 0,
          wrong: parseInt(resultSheet.data.wrong) || 0,
          empty: parseInt(resultSheet.data.empty) || 0,
        }),
      });
      setAssignments((prev) =>
        prev.map((a) => (a.id === resultSheet.item.id ? { ...a, completed: true } : a))
      );
    } catch {
      // sessiz hata
    } finally {
      closeResult();
    }
  }

  const net = resultSheet ? computeNet(resultSheet.data.correct, resultSheet.data.wrong) : "0.00";

  function renderList(items: Assignment[], showResult: boolean) {
    if (items.length === 0) {
      return (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Kayıt yok.</Text>
        </View>
      );
    }
    return items.map((item) => (
      <View key={item.id} style={styles.card}>
        <View style={[styles.dot, { backgroundColor: subjectColor(item.subject ?? "Matematik") }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardMeta}>
            {item.subject ?? "Genel"} · {item.dueDate ?? "Tarih yok"}
          </Text>
        </View>
        {showResult ? (
          <Pressable style={styles.resultBtn} onPress={() => openResult(item)}>
            <Text style={styles.resultBtnText}>Sonuç Gir</Text>
          </Pressable>
        ) : (
          <Text style={styles.doneLabel}>✓ Tamam</Text>
        )}
      </View>
    ));
  }

  return (
    <>
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Ödevlerim</Text>

        {/* Görünüm segmenti */}
        <View style={styles.seg}>
          {VIEWS.map((v) => (
            <Pressable
              key={v}
              style={[styles.segItem, view === v && styles.segItemActive]}
              onPress={() => setView(v)}
            >
              <Text style={[styles.segText, view === v && styles.segTextActive]}>{v}</Text>
            </Pressable>
          ))}
        </View>

        {/* Hafta seçici */}
        <View style={styles.weekRow}>
          <Pressable onPress={() => setWeekOffset((o) => o - 1)} style={styles.weekArrow}>
            <Text style={styles.weekArrowText}>‹</Text>
          </Pressable>
          <Text style={styles.weekLabel}>{weekLabel(weekOffset)}</Text>
          <Pressable
            onPress={() => setWeekOffset((o) => (o < 0 ? o + 1 : o))}
            style={[styles.weekArrow, weekOffset >= 0 && styles.weekArrowDisabled]}
            disabled={weekOffset >= 0}
          >
            <Text style={styles.weekArrowText}>›</Text>
          </Pressable>
        </View>

        {view === "Günlük plan" || view === "Liste" ? (
          <>
            {pending.length > 0 && (
              <>
                <Text style={styles.groupLabel}>Bekleyen ({pending.length})</Text>
                {renderList(pending, true)}
              </>
            )}
            {done.length > 0 && (
              <>
                <Text style={[styles.groupLabel, { color: ukColors.success }]}>Tamamlanan ({done.length})</Text>
                {renderList(done, false)}
              </>
            )}
            {assignments.length === 0 && (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>Bu hafta ödev yok.</Text>
              </View>
            )}
          </>
        ) : (
          /* Takvim görünümü - basit haftanın günleri */
          <View style={styles.calGrid}>
            {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
              <View key={day} style={styles.calCell}>
                <Text style={styles.calDay}>{day}</Text>
                <View style={styles.calDot} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ResultSheet */}
      <Modal visible={!!resultSheet} transparent animationType="slide" onRequestClose={closeResult}>
        <Pressable style={styles.overlay} onPress={closeResult} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{resultSheet?.item.title ?? ""}</Text>
          <Text style={styles.sheetSub}>{resultSheet?.item.subject ?? "Genel"}</Text>

          <View style={styles.sheetRow}>
            {(
              [
                ["correct", "Doğru", ukColors.success],
                ["wrong", "Yanlış", ukColors.danger],
                ["empty", "Boş", ukColors.muted],
              ] as [keyof ResultState, string, string][]
            ).map(([field, label, color]) => (
              <View key={field} style={styles.sheetField}>
                <Text style={[styles.sheetFieldLabel, { color }]}>{label}</Text>
                <TextInput
                  style={[styles.sheetInput, { borderColor: color }]}
                  keyboardType="number-pad"
                  value={resultSheet?.data[field] ?? ""}
                  onChangeText={(v) => updateResult(field, v)}
                  placeholder="0"
                  placeholderTextColor={ukColors.faint}
                />
              </View>
            ))}
          </View>

          <View style={styles.netRow}>
            <Text style={styles.netLabel}>Net</Text>
            <Text style={styles.netValue}>{net}</Text>
          </View>

          <View style={styles.sheetActions}>
            <Pressable style={styles.cancelBtn} onPress={closeResult}>
              <Text style={styles.cancelBtnText}>Vazgeç</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={() => void saveResult()}>
              <Text style={styles.saveBtnText}>Kaydet</Text>
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
  title: { fontSize: 24, fontWeight: "800", color: ukColors.text, marginBottom: ukSpace.md },
  seg: {
    flexDirection: "row",
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    padding: 4,
    marginBottom: ukSpace.md,
  },
  segItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: ukRadius.sm,
  },
  segItemActive: { backgroundColor: ukColors.primary },
  segText: { fontSize: 12, fontWeight: "700", color: ukColors.muted },
  segTextActive: { color: "#fff" },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: ukSpace.lg,
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    paddingHorizontal: ukSpace.md,
    paddingVertical: 10,
  },
  weekArrow: { padding: 8 },
  weekArrowDisabled: { opacity: 0.3 },
  weekArrowText: { fontSize: 22, fontWeight: "800", color: ukColors.primary },
  weekLabel: { fontSize: 14, fontWeight: "800", color: ukColors.text },
  groupLabel: { fontSize: 13, fontWeight: "800", color: ukColors.muted, marginBottom: 10, marginTop: 4 },
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
  dot: { width: 10, height: 10, borderRadius: 5 },
  cardTitle: { fontSize: 14, fontWeight: "800", color: ukColors.text },
  cardMeta: { marginTop: 4, fontSize: 12, fontWeight: "600", color: ukColors.muted },
  resultBtn: {
    backgroundColor: ukColors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resultBtnText: { color: ukColors.primary600, fontSize: 12, fontWeight: "800" },
  doneLabel: { color: ukColors.success, fontSize: 12, fontWeight: "800" },
  emptyWrap: { alignItems: "center", padding: ukSpace.xl },
  emptyText: { color: ukColors.muted, fontWeight: "600" },
  calGrid: { flexDirection: "row", gap: 4 },
  calCell: {
    flex: 1,
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.sm,
    padding: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: ukColors.border,
  },
  calDay: { fontSize: 11, fontWeight: "700", color: ukColors.muted, marginBottom: 6 },
  calDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ukColors.border },
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
  sheetTitle: { fontSize: 17, fontWeight: "800", color: ukColors.text },
  sheetSub: { marginTop: 4, color: ukColors.muted, fontWeight: "600", marginBottom: ukSpace.lg },
  sheetRow: { flexDirection: "row", gap: 12 },
  sheetField: { flex: 1, alignItems: "center" },
  sheetFieldLabel: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  sheetInput: {
    width: "100%",
    borderWidth: 2,
    borderRadius: ukRadius.sm,
    padding: 12,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: ukColors.text,
  },
  netRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: ukSpace.lg,
    backgroundColor: ukColors.primarySoft,
    borderRadius: ukRadius.md,
    padding: ukSpace.md,
  },
  netLabel: { fontSize: 15, fontWeight: "800", color: ukColors.primary600 },
  netValue: { fontSize: 28, fontWeight: "800", color: ukColors.primary },
  sheetActions: { flexDirection: "row", gap: 12, marginTop: ukSpace.lg },
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
