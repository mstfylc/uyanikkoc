import type { ReactNode } from "react";

type UkBadgeProps = {
  tone?: "primary" | "success" | "warning" | "danger" | "info" | "muted";
  dot?: boolean;
  children: ReactNode;
};

export function UkBadge({ tone = "muted", dot, children }: UkBadgeProps) {
  return (
    <span className={`badge badge-${tone}${dot ? " badge-dot" : ""}`}>
      {children}
    </span>
  );
}
