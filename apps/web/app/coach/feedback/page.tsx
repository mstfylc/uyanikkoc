import "@/styles/uk-admin.css";

import { AdminStoreProvider } from "@/components/admin/AdminStore";
import { CoachFeedbackPanel } from "@/components/coach/CoachFeedbackPanel";

export default function CoachFeedbackPage() {
  return (
    <AdminStoreProvider>
      <CoachFeedbackPanel />
    </AdminStoreProvider>
  );
}
