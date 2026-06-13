import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";

import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { ukColors, ukRadius, ukSpace } from "@/lib/theme";

type SubListScreenProps = {
  title: string;
  endpoint: string;
  rootKey?: string;
  itemLabel: string;
  metaLabel: string;
  suffix?: string;
};

export function SubListScreen({ title, endpoint, rootKey, itemLabel, metaLabel, suffix = "" }: SubListScreenProps) {
  const { token } = useAuth();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!token) return;
    void apiFetch<Record<string, unknown>>(endpoint, { token })
      .then((payload) => {
        if (Array.isArray(payload)) {
          setItems(payload as Record<string, unknown>[]);
          return;
        }
        if (rootKey && Array.isArray(payload[rootKey])) {
          setItems(payload[rootKey] as Record<string, unknown>[]);
          return;
        }
        const firstArray = Object.values(payload).find((value) => Array.isArray(value));
        setItems((firstArray as Record<string, unknown>[] | undefined) ?? []);
      })
      .catch(() => setItems([]));
  }, [token, endpoint, rootKey]);

  return (
    <>
      <Stack.Screen options={{ title }} />
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        {items.length === 0 ? (
          <Text style={styles.empty}>Kayıt bulunamadı.</Text>
        ) : (
          items.map((item, index) => (
            <View key={String(item.id ?? index)} style={styles.card}>
              <Text style={styles.cardTitle}>{String(item[itemLabel] ?? "Kayıt")}</Text>
              <Text style={styles.cardMeta}>
                {String(item[metaLabel] ?? "")}
                {suffix}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
  content: { padding: ukSpace.lg, paddingBottom: 40 },
  empty: { color: ukColors.muted, fontWeight: "600" },
  card: {
    backgroundColor: ukColors.surface,
    borderRadius: ukRadius.md,
    padding: ukSpace.md,
    borderWidth: 1,
    borderColor: ukColors.border,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: ukColors.text },
  cardMeta: { marginTop: 4, fontSize: 12, fontWeight: "600", color: ukColors.muted },
});
