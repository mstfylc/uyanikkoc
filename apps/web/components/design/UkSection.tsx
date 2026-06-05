import type { ReactNode } from "react";

type UkSectionProps = {
  title?: string;
  sub?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function UkSection({ title, sub, action, children, className = "" }: UkSectionProps) {
  return (
    <div className={`card ${className}`.trim()}>
      {title || action ? (
        <div className="card-head">
          <div>
            {title ? <h3>{title}</h3> : null}
            {sub ? <div className="sub">{sub}</div> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </div>
  );
}
