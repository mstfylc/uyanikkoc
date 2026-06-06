import { AdminStoreProvider } from "@/components/admin/AdminStore";
import { CoachLicensePanel } from "@/components/coach/CoachLicensePanel";

export default function CoachLicensePage() {
  return (
    <AdminStoreProvider>
      <CoachLicensePanel />
    </AdminStoreProvider>
  );
}
