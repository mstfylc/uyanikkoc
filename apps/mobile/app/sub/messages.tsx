import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack } from "expo-router";

import { MIcon } from "@/components/MIcon";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { ukColors, ukRadius, ukSpace } from "@/lib/theme";

type Thread = {
  id: string;
  title: string;
  preview: string;
};

type Message = {
  id: string;
  text: string;
  fromCoach: boolean;
  createdAt: string;
};

export default function MessagesScreen() {
  const { token } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!token) return;
    void apiFetch<{ threads: Thread[] }>("/api/student/messages", { token })
      .then((res) => setThreads(res.threads))
      .catch(() => setThreads([]));
  }, [token]);

  useEffect(() => {
    if (!activeThread || !token) return;
    void apiFetch<{ messages: Message[] }>(`/api/student/messages/${activeThread.id}`, { token })
      .then((res) => setMessages(res.messages))
      .catch(() => setMessages([]));
  }, [activeThread, token]);

  if (activeThread) {
    return (
      <>
        <Stack.Screen options={{ title: activeThread.title }} />
        <KeyboardAvoidingView
          style={styles.root}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={88}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 && (
              <Text style={styles.emptyText}>Henüz mesaj yok.</Text>
            )}
            {messages.map((msg) => (
              <View key={msg.id} style={[styles.bubble, msg.fromCoach ? styles.bubbleCoach : styles.bubbleMe]}>
                <Text style={[styles.bubbleText, msg.fromCoach ? styles.bubbleTextCoach : styles.bubbleTextMe]}>
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.msgInput}
              value={text}
              onChangeText={setText}
              placeholder="Mesaj yaz..."
              placeholderTextColor={ukColors.faint}
              multiline
            />
            <Pressable
              style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
              disabled={!text.trim()}
              onPress={() => {
                const m: Message = {
                  id: Date.now().toString(),
                  text,
                  fromCoach: false,
                  createdAt: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, m]);
                setText("");
              }}
            >
              <MIcon name="send" size={20} color="#fff" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Mesajlar" }} />
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        {threads.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MIcon name="message" size={32} color={ukColors.faint} />
            <Text style={styles.emptyText}>Mesaj bulunamadı.</Text>
          </View>
        ) : (
          threads.map((thread) => (
            <Pressable key={thread.id} style={styles.card} onPress={() => setActiveThread(thread)}>
              <View style={styles.threadAvatar}>
                <MIcon name="user" size={18} color={ukColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{thread.title}</Text>
                <Text style={styles.cardMeta} numberOfLines={1}>{thread.preview}</Text>
              </View>
              <MIcon name="chevronRight" size={16} color={ukColors.faint} />
            </Pressable>
          ))
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
  content: { padding: ukSpace.lg, paddingBottom: 40 },
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
  threadAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ukColors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: ukColors.text },
  cardMeta: { marginTop: 4, fontSize: 12, fontWeight: "600", color: ukColors.muted },
  emptyWrap: { alignItems: "center", gap: 10, padding: ukSpace.xl },
  emptyText: { color: ukColors.muted, fontWeight: "600", textAlign: "center" },
  chatArea: { flex: 1 },
  chatContent: { padding: ukSpace.lg, gap: 10, paddingBottom: 20 },
  bubble: {
    maxWidth: "78%",
    borderRadius: ukRadius.lg,
    padding: ukSpace.md,
  },
  bubbleCoach: {
    backgroundColor: ukColors.surface,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: ukColors.border,
  },
  bubbleMe: {
    backgroundColor: ukColors.primary,
    alignSelf: "flex-end",
  },
  bubbleText: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  bubbleTextCoach: { color: ukColors.text },
  bubbleTextMe: { color: "#fff" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: ukSpace.md,
    backgroundColor: ukColors.surface,
    borderTopWidth: 1,
    borderTopColor: ukColors.border,
  },
  msgInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: ukColors.border,
    borderRadius: ukRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "600",
    color: ukColors.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ukColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
});
