import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { ukColors, ukRadius, ukSpace } from "@/lib/theme";

const FAQ = [
  { q: "Ödevimi nasıl tamamlarım?", a: "Ödevler sekmesinden ilgili ödevi bulun ve 'Sonuç Gir' butonuna tıklayın." },
  { q: "Koçumla nasıl iletişim kurarım?", a: "Mesajlar alt ekranından koçunuza mesaj gönderebilirsiniz." },
  { q: "Deneme sonuçlarımı nasıl eklerim?", a: "Denemeler sekmesinden 'Deneme kaydet' butonunu kullanabilirsiniz." },
];

export default function DestekScreen() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  return (
    <>
      <Stack.Screen options={{ title: "Destek" }} />
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Sık Sorulan Sorular</Text>
        {FAQ.map((faq, i) => (
          <Pressable
            key={i}
            style={[styles.faqCard, openIdx === i && styles.faqCardOpen]}
            onPress={() => setOpenIdx(openIdx === i ? null : i)}
          >
            <View style={styles.faqHead}>
              <Text style={styles.faqQ}>{faq.q}</Text>
              <MIcon name={openIdx === i ? "chevronDown" : "chevronRight"} size={16} color={ukColors.muted} />
            </View>
            {openIdx === i && (
              <Text style={styles.faqA}>{faq.a}</Text>
            )}
          </Pressable>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: ukSpace.xl }]}>Destek Talebi</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.msgInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Sorununuzu açıklayın..."
            placeholderTextColor={ukColors.faint}
            multiline
            numberOfLines={4}
          />
        </View>
        <Pressable
          style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
          disabled={!message.trim()}
          onPress={() => setMessage("")}
        >
          <MIcon name="send" size={18} color="#fff" />
          <Text style={styles.sendBtnText}>Gönder</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
  content: { padding: ukSpace.lg, paddingBottom: 40 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: ukColors.text, marginBottom: 12 },
  faqCard: {
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    padding: ukSpace.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    marginBottom: 8,
  },
  faqCardOpen: { borderColor: ukColors.primary },
  faqHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  faqQ: { fontSize: 14, fontWeight: "700", color: ukColors.text, flex: 1, marginRight: 8 },
  faqA: { marginTop: 10, fontSize: 13, fontWeight: "600", color: ukColors.muted, lineHeight: 20 },
  inputWrap: {
    borderWidth: 1,
    borderColor: ukColors.border,
    borderRadius: ukRadius.md,
    backgroundColor: ukColors.surface,
    marginBottom: ukSpace.md,
  },
  msgInput: {
    padding: ukSpace.md,
    fontSize: 14,
    fontWeight: "600",
    color: ukColors.text,
    minHeight: 100,
    textAlignVertical: "top",
  },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: ukColors.primary,
    borderRadius: ukRadius.md,
    minHeight: 48,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
