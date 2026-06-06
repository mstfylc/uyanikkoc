/* Alt menü (tab bar). */
import { MIcon } from "./MIcon";
import type { IconName } from "./icons";
import type { TabId } from "../types";

interface Tab {
  id: TabId;
  label: string;
  icon: IconName;
  count?: number;
}

export function TabBar({ active, go, pendingCount }: { active: TabId; go: (t: TabId) => void; pendingCount: number }) {
  const tabs: Tab[] = [
    { id: "home", label: "Ana Sayfa", icon: "home" },
    { id: "odevler", label: "Ödevler", icon: "clipboard", count: pendingCount },
    { id: "denemeler", label: "Denemeler", icon: "chart" },
    { id: "program", label: "Program", icon: "calendar" },
    { id: "profil", label: "Profil", icon: "user" },
  ];
  return (
    <div className="uk-tabbar">
      {tabs.map((t) => (
        <button key={t.id} className={`uk-tab${active === t.id ? " on" : ""}`} onClick={() => go(t.id)}>
          {t.count ? <span className="tabcount">{t.count}</span> : null}
          <MIcon name={t.icon} size={24} fill={active === t.id} stroke={active === t.id ? 0 : 2} />
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
