// Admin istemci store'u — snapshot fetch + optimistik mutasyon + hafif toast.
// apps/web/components/admin/AdminStore.tsx
// Prototip kaynağı: admin/admin-data.jsx (useAdmin + actions) + src/ui-actions.jsx (toast).
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { KiIcon } from "@/components/design/KiIcon";
import type { AdminAccess, AdminMutation, AdminSnapshot } from "@/lib/admin/types";

type ToastTone = "primary" | "success" | "warning" | "danger";
type Toast = { id: number; text: string; icon: string; tone: ToastTone };

type AdminStoreValue = {
  snapshot: AdminSnapshot | null;
  loading: boolean;
  error: string | null;
  /** UI bağlamı: kurum yöneticisinin yönettiği kurum (oturum). */
  activeOrgId: string;
  setActiveOrgId: (id: string) => void;
  /** Demo: süper admin görüntüleme rolünü (full/support) yerel olarak değiştirir. */
  setViewerAccess: (access: AdminAccess) => void;
  mutate: (m: AdminMutation) => Promise<void>;
  toast: (text: string, opts?: { icon?: string; tone?: ToastTone }) => void;
};

const AdminStoreContext = createContext<AdminStoreValue | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOrgId, setActiveOrgIdState] = useState<string>("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const toast = useCallback(
    (text: string, opts?: { icon?: string; tone?: ToastTone }) => {
      const id = ++toastId.current;
      const t: Toast = { id, text, icon: opts?.icon ?? "ki-check-circle", tone: opts?.tone ?? "primary" };
      setToasts((prev) => [...prev, t]);
      window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2600);
    },
    [],
  );

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/snapshot", { credentials: "same-origin" });
        if (!res.ok) throw new Error("snapshot " + res.status);
        const data = (await res.json()) as AdminSnapshot;
        if (!alive) return;
        setSnapshot(data);
        setActiveOrgIdState((cur) => cur || data.activeOrgId);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "load error");
      } finally {
        if (alive) setLoading(false);
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, []);

  const setActiveOrgId = useCallback((id: string) => setActiveOrgIdState(id), []);

  const setViewerAccess = useCallback((access: AdminAccess) => {
    setSnapshot((prev) => (prev ? { ...prev, viewerAccess: access } : prev));
  }, []);

  const mutate = useCallback(async (m: AdminMutation) => {
    const res = await fetch("/api/admin/mutate", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(m),
    });
    if (!res.ok) throw new Error("mutate " + res.status);
    const data = (await res.json()) as AdminSnapshot;
    setSnapshot(data);
  }, []);

  const value = useMemo<AdminStoreValue>(
    () => ({ snapshot, loading, error, activeOrgId, setActiveOrgId, setViewerAccess, mutate, toast }),
    [snapshot, loading, error, activeOrgId, setActiveOrgId, setViewerAccess, mutate, toast],
  );

  return (
    <AdminStoreContext.Provider value={value}>
      {children}
      <div className="toast-host" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tone}`}>
            <KiIcon name={t.icon} size={17} />
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore(): AdminStoreValue {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) throw new Error("useAdminStore must be used within AdminStoreProvider");
  return ctx;
}

/** Kısayol: yüklenmiş snapshot'ı garanti eder (yoksa null döndürür, panel iskelet gösterir). */
export function useSnapshot(): AdminSnapshot | null {
  return useAdminStore().snapshot;
}
