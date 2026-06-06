import { SubListScreen } from "@/components/SubListScreen";

export default function MessagesScreen() {
  return <SubListScreen title="Mesajlar" endpoint="/api/student/messages" rootKey="threads" itemLabel="title" metaLabel="preview" />;
}
