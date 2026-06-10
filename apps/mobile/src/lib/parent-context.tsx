import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { P_CHILDREN, type ParentChild } from "./parent-data";

type ParentState = {
  children: ParentChild[];
  child: ParentChild;
  setChildId: (id: string) => void;
};

const ParentContext = createContext<ParentState | null>(null);

export function ParentProvider({ children: node }: { children: ReactNode }) {
  const [childId, setChildId] = useState(P_CHILDREN[0].id);
  const child = useMemo(() => P_CHILDREN.find((c) => c.id === childId) ?? P_CHILDREN[0], [childId]);
  const value = useMemo<ParentState>(() => ({ children: P_CHILDREN, child, setChildId }), [child]);
  return <ParentContext.Provider value={value}>{node}</ParentContext.Provider>;
}

export function useParent(): ParentState {
  const ctx = useContext(ParentContext);
  if (!ctx) throw new Error("useParent must be used within ParentProvider");
  return ctx;
}
