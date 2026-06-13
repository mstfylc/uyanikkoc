import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Redirect } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { useAuth } from "@/lib/auth";
import { ukColors, ukRadius, ukSpace } from "@/lib/theme";

export default function LoginScreen() {
  const { token, login } = useAuth();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<"phone" | "email">("email");
  const [email, setEmail] = useState("student@uyanik.local");
  const [password, setPassword] = useState("uyanik123");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      if (mode === "phone") {
        setError("Telefon/SMS girisi henuz aktif degil. E-posta ile devam edin.");
        return;
      }
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giris basarisiz");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.hero, { paddingTop: insets.top + ukSpace.xl }]}>
          <View style={styles.markWrap}>
            <MIcon name="shield" size={28} color="#fff" />
          </View>
          <Text style={styles.brand}>Uyanik Koc</Text>
          <Text style={styles.heroTitle}>Hedefe giden{"\n"}yolda yanindayiz</Text>
          <Text style={styles.heroSub}>Kocunla, odevlerinle ve denemelerinle tek yerde.</Text>
        </View>

        <View style={[styles.form, { paddingBottom: insets.bottom + ukSpace.lg }]}>
          {mode === "email" ? (
            <>
              <Text style={styles.label}>E-posta</Text>
              <View style={styles.inputWrap}>
                <MIcon name="mail" size={18} color={ukColors.muted} />
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  placeholder="ornek@eposta.com"
                  placeholderTextColor={ukColors.faint}
                />
              </View>
              <Text style={[styles.label, { marginTop: ukSpace.md }]}>Sifre</Text>
              <View style={styles.inputWrap}>
                <MIcon name="shield" size={18} color={ukColors.muted} />
                <TextInput
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  placeholder="********"
                  placeholderTextColor={ukColors.faint}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Telefon numarasi</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.prefix}>+90</Text>
                <TextInput
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                  placeholder="5__ ___ __ __"
                  placeholderTextColor={ukColors.faint}
                />
              </View>
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={[styles.primaryBtn, loading && styles.disabled]} onPress={() => void handleLogin()} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Giris Yap</Text>}
          </Pressable>

          <Pressable style={styles.secondaryBtn} onPress={() => setMode(mode === "email" ? "phone" : "email")}>
            <Text style={styles.secondaryBtnText}>
              {mode === "email" ? "Telefon ile giris" : "E-posta ile giris"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
  scroll: { flexGrow: 1 },
  hero: {
    paddingHorizontal: ukSpace.lg,
    paddingBottom: ukSpace.xl,
    backgroundColor: ukColors.primary,
  },
  markWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  brand: { marginTop: 14, color: "#fff", fontSize: 22, fontWeight: "800" },
  heroTitle: { marginTop: 24, color: "#fff", fontSize: 28, fontWeight: "800", lineHeight: 34 },
  heroSub: { marginTop: 10, color: "rgba(255,255,255,0.88)", fontSize: 14, fontWeight: "600", lineHeight: 20 },
  form: {
    flex: 1,
    marginTop: -18,
    backgroundColor: ukColors.surface,
    borderTopLeftRadius: ukRadius.xl,
    borderTopRightRadius: ukRadius.xl,
    padding: ukSpace.lg,
  },
  label: { fontSize: 13, fontWeight: "700", color: ukColors.muted, marginBottom: 8 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: ukColors.border,
    borderRadius: ukRadius.md,
    paddingHorizontal: 14,
    minHeight: 52,
    backgroundColor: "#FAFAFD",
  },
  prefix: { fontWeight: "800", color: ukColors.text },
  input: { flex: 1, fontSize: 15, fontWeight: "600", color: ukColors.text },
  error: { marginTop: ukSpace.sm, color: ukColors.danger, fontSize: 13, fontWeight: "600" },
  primaryBtn: {
    marginTop: ukSpace.lg,
    backgroundColor: ukColors.primary,
    borderRadius: ukRadius.md,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  secondaryBtn: {
    marginTop: ukSpace.sm,
    borderRadius: ukRadius.md,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ukColors.primarySoft,
  },
  secondaryBtnText: { color: ukColors.primary600, fontSize: 14, fontWeight: "700" },
  disabled: { opacity: 0.7 },
});
