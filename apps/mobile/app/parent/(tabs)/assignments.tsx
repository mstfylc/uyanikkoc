import { ScrollView, View } from "react-native";

import { PageTitle, POdevCard, SectionHead } from "@/components/parent-ui";
import { useParent } from "@/lib/parent-context";
import { ukColors } from "@/lib/theme";

export default function ParentAssignments() {
  const { child } = useParent();
  const pending = child.odev.filter((o) => o.status !== "done");
  const done = child.odev.filter((o) => o.status === "done");
  return (
    <ScrollView style={{ flex: 1, backgroundColor: ukColors.bg }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 28 }}>
      <PageTitle title="Ödevler" sub={`${child.name} · ${pending.length} bekleyen`} />
      {pending.length > 0 ? (
        <View style={{ marginBottom: 12 }}>
          <SectionHead title={`Bekleyen · ${pending.length}`} />
          {pending.map((o) => <POdevCard key={o.id} o={o} />)}
        </View>
      ) : null}
      {done.length > 0 ? (
        <View style={{ marginTop: 10 }}>
          <SectionHead title={`Tamamlanan · ${done.length}`} />
          {done.map((o) => <POdevCard key={o.id} o={o} />)}
        </View>
      ) : null}
    </ScrollView>
  );
}
