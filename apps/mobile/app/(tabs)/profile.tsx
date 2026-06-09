import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { ScreenScroll } from "@/components/ScreenScroll";
import { useAuth } from "@/lib/auth";
import { ukColors, ukRadius, ukSpace } from "@/lib/theme";

export default function ProfileTab() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <ScreenScroll>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.email ?? "UK").slice(0, 2).toUpperCase()}</Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>{user?.email ?? "Ogrenci"}</Text>
        <Text style={styles.sub}>Ogrenci hesabi</Text>
      </View>

      {[
        ["topics", "Konu Takibi"],
        ["resources", "Kaynaklarim"],
        ["appointments", "Randevular"],
        ["messages", "Mesajlar"],
        ["motivation", "Motivasyon"],
      ].map(([route, label]) => (
        <Pressable key={route} style={styles.row} onPress={() => router.push(`/sub/${route}` as never)}>
          <Text style={styles.rowText} numberOfLines={1}>{label}</Text>
          <MIcon name="chevronRight" size={18} color={ukColors.faint} />
        </Pressable>
      ))}

      <Pressable
        style={[styles.row, styles.logout]}
        onPress={() => {
          void logout().then(() => router.replace("/login"));
        }}
      >
        <MIcon name="logout" size={18} color={ukColors.danger} />
        <Text style={styles.logoutText}>Cikis Yap</Text>
      </Pressable>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignSelf: "stretch",
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    padding: ukSpace.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    marginBottom: 10,
  },
  rowText: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: "700", color: ukColors.text },
  logout: { marginTop: ukSpace.md, justifyContent: "flex-start", gap: 10 },
  logoutText: { color: ukColors.danger, fontWeight: "800" },
});
