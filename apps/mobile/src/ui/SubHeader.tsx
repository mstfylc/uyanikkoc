/* Alt-ekran başlığı: geri butonu + başlık + isteğe bağlı eylem. */
import { MIcon } from "./MIcon";
import type { ReactNode } from "react";

export function SubHeader({ title, sub, onBack, action }: { title: string; sub?: string; onBack: () => void; action?: ReactNode }) {
  return (
    <>
      <div style={{ padding: "4px 16px 0" }}>
        <button className="uk-iconbtn" onClick={onBack} style={{ width: 40, height: 40 }}>
          <MIcon name="chevronLeft" size={20} />
        </button>
      </div>
      <div className="uk-ptitle" style={{ paddingTop: 8, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 24, whiteSpace: "nowrap" }}>{title}</h1>
          {sub ? <p>{sub}</p> : null}
        </div>
        {action ?? null}
      </div>
    </>
  );
}
