import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { C_THREADS } from "@/lib/coach-data";
import { ukColors, ukSpace } from "@/lib/theme";

export default function CoachThread() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const thread = useMemo(() => C_THREADS.find((t) => t.id === id) ?? C_THREADS[0], [id]);
  const [msgs, setMsgs] = useState(thread.msgs);
  const [val, setVal] = useState("");

  const send = () => {
    const t = val.trim();
    if (!t) return;
    setMsgs((m) => [...m, { from: "me", text: t, time: "şimdi" }]);
    setVal("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: ukColors.bg }}>
      <View style={st.head}>
        <Pressable style={st.iconBtn} onPress={() => router.back()}><MIcon name="chevronLeft" size={20} color={ukColors.text} /></Pressable>
        <View style={st.avatar}><Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>{thread.initials}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: ukColors.text }}>{thread.name}</Text>
          <Text style={{ fontSize: 11.5, fontWeight: "700", color: ukColors.muted }}>{thread.kind}</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 10 }}>
          {msgs.map((m, i) => {
            const me = m.from === "me";
            return (
              <View key={i} style={{ alignItems: me ? "flex-end" : "flex-start" }}>
                <View style={[st.bubble, me ? st.bubbleMe : st.bubbleThem]}>
                  <Text style={{ color: me ? "#fff" : ukColors.text, fontSize: 14, lineHeight: 19 }}>{m.text}</Text>
                  <Text style={{ fontSize: 10, marginTop: 4, textAlign: "right", color: me ? "rgba(255,255,255,0.7)" : ukColors.muted }}>{m.time}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
        <View style={st.inputBar}>
          <TextInput style={st.input} placeholder="Mesaj yaz…" placeholderTextColor={ukColors.faint} value={val} onChangeText={setVal} onSubmitEditing={send} returnKeyType="send" />
          <Pressable style={st.sendBtn} onPress={send}><MIcon name="send" size={19} color="#fff" /></Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: ukSpace.md, paddingTop: 8, paddingBottom: 12, borderBottomColor: ukColors.border, borderBottomWidth: 1, backgroundColor: ukColors.surface },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: ukColors.primary, alignItems: "center", justifyContent: "center" },
  bubble: { maxWidth: "80%", paddingHorizontal: 13, paddingVertical: 10, borderRadius: 16 },
  bubbleMe: { backgroundColor: ukColors.primary, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: ukColors.surface, borderColor: ukColors.border, borderWidth: 1, borderBottomLeftRadius: 4 },
  inputBar: { flexDirection: "row", gap: 10, padding: 12, borderTopColor: ukColors.border, borderTopWidth: 1, backgroundColor: ukColors.surface },
  input: { flex: 1, height: 48, borderRadius: 14, borderColor: ukColors.border, borderWidth: 1, paddingHorizontal: 16, fontSize: 14, color: ukColors.text, backgroundColor: ukColors.bg },
  sendBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: ukColors.primary, alignItems: "center", justifyContent: "center" },
});
