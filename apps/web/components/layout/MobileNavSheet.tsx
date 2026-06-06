"use client";

import type { AppRole } from "@uyanik/tokens";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { KiIcon } from "@/components/design/KiIcon";
import { getUkGeneralNavItems, getUkNavItems } from "@/lib/navigation/uk-nav";

type MobileNavSheetProps = {
  role: AppRole;
  open: boolean;
  onClose: () => void;
};

export function MobileNavSheet({ role, open, onClose }: MobileNavSheetProps) {
  const pathname = usePathname();

  if (!open) {
    return null;
  }

  const items = [...getUkNavItems(role), ...getUkGeneralNavItems(role)];

  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 45, background: "rgba(15,23,42,.35)" }}
        onClick={onClose}
        aria-hidden
      />
      <nav
        className="mobile-nav-sheet"
        aria-label="Mobil menu"
        style={{
          position: "fixed",
          top: "var(--header-h)",
          left: 0,
          right: 0,
          zIndex: 46,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)",
          maxHeight: "calc(100vh - var(--header-h))",
          overflowY: "auto",
          padding: "12px 14px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== `/${role}/dashboard` && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${active ? " active" : ""}`}
              onClick={onClose}
            >
              <KiIcon name={item.icon} size={18} />
              <span>{item.label}</span>
              {item.tag ? <span className="nav-tag">{item.tag}</span> : null}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
