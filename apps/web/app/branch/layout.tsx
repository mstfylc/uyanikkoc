import { AppLayout } from "@/components/layout/AppLayout";

export default function BranchLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout role="branch">{children}</AppLayout>;
}
