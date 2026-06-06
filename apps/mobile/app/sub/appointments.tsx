import { SubListScreen } from "@/components/SubListScreen";

export default function AppointmentsScreen() {
  return (
    <SubListScreen
      title="Randevular"
      endpoint="/api/student/appointments"
      rootKey="appointments"
      itemLabel="topic"
      metaLabel="status"
    />
  );
}
