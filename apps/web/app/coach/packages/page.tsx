import "@/styles/uk-admin.css";

import { AdminStoreProvider } from "@/components/admin/AdminStore";
import { CoachPackages } from "@/components/admin/StudentPackages";

export default function CoachPackagesPage() {
  return (
    <AdminStoreProvider>
      <CoachPackages />
    </AdminStoreProvider>
  );
}
