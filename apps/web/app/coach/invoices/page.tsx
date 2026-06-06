import { AdminStoreProvider } from "@/components/admin/AdminStore";
import { CoachInvoicesPanel } from "@/components/coach/CoachInvoicesPanel";

export default function CoachInvoicesPage() {
  return (
    <AdminStoreProvider>
      <CoachInvoicesPanel />
    </AdminStoreProvider>
  );
}
