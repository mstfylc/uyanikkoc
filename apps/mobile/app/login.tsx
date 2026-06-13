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
import { Redirect } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { useAuth } from "@/lib/auth";
import { ukColors, ukRadius, ukSpace } from "@/lib/theme";

type Mode = "enter" | "otp" | "register" | "forgot";

export default function LoginScreen() {
  const { token, login } = useAuth();
  const [mode, setMode] = useState<"phone" | "email">("email");
  const [step, setStep] = useState<Mode>("enter");
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
        setError("Telefon/SMS girişi henüz aktif değil. E-posta ile devam edin.");
        return;
      }
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  }

  const phoneValid = phone.replace(/\D/g, "").length >= 10;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.markWrap}>
            <MIcon name="shield" size={28} color="#fff" />
          </View>
          <Text style={styles.brand}>Uyanık Koç</Text>
          <Text style={styles.heroTitle}>Hedefe giden{"\n"}yolda yanındayız</Text>
          <Text style={styles.heroSub}>Koçunla, ödevlerinle ve denemelerinle tek yerde.</Text>
        </View>

        <View style={styles.form}>
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
              <Text style={[styles.label, { marginTop: ukSpace.md }]}>Şifre</Text>
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

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[styles.primaryBtn, loading && styles.disabled]}
                onPress={() => void handleLogin()}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Giriş Yap</Text>}
              </Pressable>

              <Pressable style={styles.secondaryBtn} onPress={() => setMode("phone")}>
                <Text style={styles.secondaryBtnText}>Telefon ile giriş</Text>
              </Pressable>
            </>
          ) : step === "enter" ? (
            <>
              <Text style={styles.label}>Telefon numarası</Text>
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

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[styles.primaryBtn, !phoneValid && styles.disabled]}
                onPress={() => {
                  if (phoneValid) setStep("otp");
                }}
                disabled={!phoneValid}
              >
                <Text style={styles.primaryBtnText}>SMS Kodu Gönder</Text>
              </Pressable>

              <Pressable style={styles.secondaryBtn} onPress={() => setMode("email")}>
                <Text style={styles.secondaryBtnText}>E-posta ile giriş</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.label}>Doğrulama kodu</Text>
              <Text style={styles.otpHint}>+90 {phone} numarasına gönderildi</Text>
              <View style={styles.inputWrap}>
                <MIcon name="shield" size={18} color={ukColors.muted} />
                <TextInput
                  keyboardType="number-pad"
                  maxLength={6}
                  style={[styles.input, styles.otpInput]}
                  placeholder="● ● ● ● ● ●"
                  placeholderTextColor={ukColors.faint}
                />
              </View>

              <Pressable style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Doğrula ve Giriş Yap</Text>
              </Pressable>

              <Pressable style={styles.secondaryBtn} onPress={() => setStep("enter")}>
                <Text style={styles.secondaryBtnText}>Geri dön</Text>
              </Pressable>
            </>
          )}

          <View style={styles.links}>
            <Pressable>
              <Text style={styles.link}>Kayıt ol</Text>
            </Pressable>
            <Text style={styles.linkSep}>·</Text>
            <Pressable>
              <Text style={styles.link}>Kurumundan davet iste</Text>
            </Pressable>
          </View>

          <Text style={styles.legal}>
            Giriş yaparak{" "}
            <Text style={styles.legalLink}>Kullanım Koşulları</Text>
            {"'nı ve "}
            <Text style={styles.legalLink}>Gizlilik Politikası</Text>
            {"'nı kabul etmiş olursunuz."}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
  scroll: { flexGrow: 1 },
  hero: {
    paddingTop: 72,
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
    paddingBottom: ukSpace.xl,
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
  otpInput: { letterSpacing: 8, fontSize: 18 },
  otpHint: { color: ukColors.muted, fontSize: 13, fontWeight: "600", marginBottom: 10 },
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
  disabled: { opacity: 0.5 },
  links: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: ukSpace.lg },
  link: { color: ukColors.primary600, fontWeight: "700", fontSize: 13 },
  linkSep: { color: ukColors.faint, fontSize: 13 },
  legal: { marginTop: ukSpace.md, color: ukColors.faint, fontSize: 11, textAlign: "center", lineHeight: 16 },
  legalLink: { color: ukColors.primary600, fontWeight: "700" },
});
