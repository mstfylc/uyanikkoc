import { SubListScreen } from "@/components/SubListScreen";

export default function TopicsScreen() {
  return <SubListScreen title="Konu Takibi" endpoint="/api/student/topics" rootKey="subjects" itemLabel="name" metaLabel="examType" />;
}
