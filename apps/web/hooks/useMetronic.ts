"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    KTApp?: { init: () => void };
    KTMenu?: { createInstances: () => void };
    KTDrawer?: { createInstances: () => void };
    KTLayout?: { init: () => void };
  }
}

export function useMetronic(): void {
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.add(
      "demo1",
      "kt-sidebar-fixed",
      "kt-header-fixed",
      "antialiased",
      "flex",
      "h-full",
      "text-base",
      "text-foreground",
      "bg-background",
    );

    const timer = window.setTimeout(() => {
      window.KTApp?.init();
      window.KTMenu?.createInstances();
      window.KTDrawer?.createInstances();
      window.KTLayout?.init();
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pathname]);
}
