import type { ReactNode } from "react";

type UkPageHeadProps = {
  title: string;
  sub?: string;
  actions?: ReactNode;
};

export function UkPageHead({ title, sub, actions }: UkPageHeadProps) {
  return (
    <div className="between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>{title}</h1>
        {sub ? (
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
            {sub}
          </p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}
