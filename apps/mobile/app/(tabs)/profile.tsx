import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { useAuth } from "@/lib/auth";
import { ukColors, ukRadius, ukSpace } from "@/lib/theme";

export default function ProfileTab() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const displayName = user?.email?.split("@")[0] ?? "Öğrenci";

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Avatar + bilgi */}
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.slice(0, 2).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.sub}>Öğrenci hesabı</Text>
      </View>

      {/* Tercihler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tercihler</Text>
        <View style={styles.prefRow}>
          <View style={styles.prefLeft}>
            <MIcon name="bell" size={20} color={ukColors.primary} />
            <View>
              <Text style={styles.prefLabel}>Bildirimler</Text>
              <Text style={styles.prefSub}>Ödev ve deneme hatırlatmaları</Text>
            </View>
          </View>
          <Switch
            value={notifEnabled}
            onValueChange={setNotifEnabled}
            trackColor={{ true: ukColors.primary, false: ukColors.border }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.prefRow}>
          <View style={styles.prefLeft}>
            <MIcon name="moon" size={20} color={ukColors.primary} />
            <View>
              <Text style={styles.prefLabel}>Koyu tema</Text>
              <Text style={styles.prefSub}>Ekran görünümü</Text>
            </View>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ true: ukColors.primary, false: ukColors.border }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Alt ekran kısayolları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kısayollar</Text>
        {(
          [
            ["topics", "book", "Konu Takibi"],
            ["resources", "notebook", "Kaynaklarım"],
            ["appointments", "calendar", "Randevular"],
            ["messages", "message", "Mesajlar"],
            ["motivation", "heart", "Motivasyon"],
            ["destek", "help", "Destek"],
          ] as [string, string, string][]
        ).map(([route, icon, label]) => (
          <Pressable
            key={route}
            style={styles.row}
            onPress={() => router.push(`/sub/${route}` as never)}
          >
            <View style={styles.rowLeft}>
              <MIcon name={icon} size={18} color={ukColors.primary} />
              <Text style={styles.rowText}>{label}</Text>
            </View>
            <MIcon name="chevronRight" size={18} color={ukColors.faint} />
          </Pressable>
        ))}
      </View>

      {/* Başarımlar */}
      <Pressable style={styles.achieveRow}>
        <View style={styles.rowLeft}>
          <MIcon name="award" size={18} color={ukColors.warning} />
          <Text style={styles.rowText}>Başarımlar</Text>
        </View>
        <MIcon name="chevronRight" size={18} color={ukColors.faint} />
      </Pressable>

      {/* Çıkış */}
      <Pressable
        style={[styles.row, styles.logout]}
        onPress={() => {
          void logout().then(() => router.replace("/login"));
        }}
      >
        <MIcon name="logout" size={18} color={ukColors.danger} />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
  content: { padding: ukSpace.lg, paddingBottom: 40 },
  hero: {
    alignItems: "center",
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.lg,
    padding: ukSpace.lg,
    borderWidth: 1,
    borderColor: ukColors.border,
    marginBottom: ukSpace.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: ukColors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: ukColors.primary600, fontWeight: "800", fontSize: 22 },
  name: { marginTop: 12, fontSize: 18, fontWeight: "800", color: ukColors.text },
  sub: { marginTop: 4, color: ukColors.muted, fontWeight: "600" },
  section: { marginBottom: ukSpace.md },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: ukColors.muted, marginBottom: 10 },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    padding: ukSpace.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    marginBottom: 8,
  },
  prefLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  prefLabel: { fontSize: 14, fontWeight: "700", color: ukColors.text },
  prefSub: { fontSize: 11, color: ukColors.muted, fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    padding: ukSpace.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    marginBottom: 8,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowText: { fontSize: 14, fontWeight: "700", color: ukColors.text },
  achieveRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: ukColors.warningSoft,
    borderRadius: ukRadius.md,
    padding: ukSpace.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    marginBottom: ukSpace.lg,
  },
  logout: { justifyContent: "flex-start", gap: 10, marginTop: ukSpace.sm },
  logoutText: { color: ukColors.danger, fontWeight: "800" },
});
