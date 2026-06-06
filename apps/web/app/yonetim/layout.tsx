import "@/styles/uk-admin.css";

import { YonetimShell } from "@/components/admin/YonetimShell";

export default function YonetimLayout({ children }: { children: React.ReactNode }) {
  return <YonetimShell>{children}</YonetimShell>;
}
