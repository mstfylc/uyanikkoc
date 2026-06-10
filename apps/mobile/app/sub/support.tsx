import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { Chips, Sheet, SheetField } from "@/components/Sheet";
import { ukColors, ukRadius, ukSpace } from "@/lib/theme";

const TOPICS = ["Teknik sorun", "Ödev/Deneme", "Hesap", "Diğer"] as const;

const FAQ = [
  { q: "Ödev sonucumu nasıl girerim?", a: "Ödevler sekmesinde ilgili ödevin “Sonuç Gir” butonuna dokun; doğru/yanlış/boş değerlerini gir, net otomatik hesaplanır." },
  { q: "Deneme sonucumu nasıl kaydederim?", a: "Denemeler sekmesinde “Deneme kaydet” ile deneme adı ve ders bazlı netlerini girerek kaydedebilirsin." },
  { q: "Koçumla nasıl mesajlaşırım?", a: "Profil veya ana sayfadaki hızlı erişimden Mesajlar ekranına geçip koçuna yazabilirsin." },
  { q: "Randevu nasıl alırım?", a: "Randevular ekranından uygun bir saat seçip yüz yüze, online veya telefon görüşmesi talep edebilirsin." },
  { q: "Bildirimleri nasıl kapatırım?", a: "Profil > Tercihler altından Bildirimler anahtarını kapatabilirsin." },
];

export default function SupportScreen() {
  const [open, setOpen] = useState<number | null>(0);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("Teknik sorun");
  const [msg, setMsg] = useState("");
  const ok = msg.trim().length > 3;

  const submit = () => {
    if (!ok) return;
    setTicketOpen(false);
    setMsg("");
    Alert.alert("Talebiniz alındı", "Destek ekibimiz en kısa sürede dönüş yapacak.");
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ padding: ukSpace.lg, paddingBottom: 28 }}>
      <Stack.Screen options={{ title: "Destek" }} />
      <View style={st.banner}>
        <View style={st.bannerIc}><MIcon name="help" size={20} color={ukColors.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: ukColors.text }}>Sıkça sorulan sorular</Text>
          <Text style={{ fontSize: 12.5, color: ukColors.muted, fontWeight: "600", marginTop: 2 }}>Aradığını bulamazsan destek talebi oluştur.</Text>
        </View>
      </View>

      <View style={{ gap: 9, marginTop: 16 }}>
        {FAQ.map((f, i) => {
          const on = open === i;
          return (
            <Pressable key={i} style={st.card} onPress={() => setOpen(on ? null : i)}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: "700", color: ukColors.text }}>{f.q}</Text>
                <MIcon name={on ? "chevronDown" : "chevronRight"} size={18} color={ukColors.faint} />
              </View>
              {on ? <Text style={{ fontSize: 13, color: ukColors.text, opacity: 0.85, lineHeight: 20, marginTop: 10 }}>{f.a}</Text> : null}
            </Pressable>
          );
        })}
      </View>

      <Pressable style={st.primaryBtn} onPress={() => setTicketOpen(true)}>
        <MIcon name="message" size={17} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 14.5, fontWeight: "700" }}>Destek talebi oluştur</Text>
      </Pressable>

      <Sheet
        open={ticketOpen}
        title="Destek talebi"
        sub="Sorununuzu iletin"
        onClose={() => setTicketOpen(false)}
        footer={<Pressable style={[st.primaryBtn, { marginTop: 0 }, !ok && { opacity: 0.5 }]} disabled={!ok} onPress={submit}><MIcon name="send" size={16} color="#fff" /><Text style={{ color: "#fff", fontSize: 14.5, fontWeight: "700" }}>Gönder</Text></Pressable>}
      >
        <SheetField label="Konu"><Chips options={TOPICS} value={topic} onChange={setTopic} /></SheetField>
        <SheetField label="Mesaj"><TextInput style={st.input} value={msg} onChangeText={setMsg} placeholder="Yaşadığınız sorunu yazın…" placeholderTextColor={ukColors.faint} multiline /></SheetField>
      </Sheet>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  banner: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: ukColors.surface, borderColor: ukColors.border, borderWidth: 1, borderRadius: ukRadius.lg, padding: 14 },
  bannerIc: { width: 40, height: 40, borderRadius: 12, backgroundColor: ukColors.primarySoft, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: ukColors.surface, borderColor: ukColors.border, borderWidth: 1, borderRadius: ukRadius.lg, padding: 16 },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 15, backgroundColor: ukColors.primary, marginTop: 18 },
  input: { minHeight: 90, borderRadius: 13, borderColor: ukColors.border, borderWidth: 1, paddingHorizontal: 14, paddingTop: 12, fontSize: 14, color: ukColors.text, backgroundColor: ukColors.bg, textAlignVertical: "top" },
});
