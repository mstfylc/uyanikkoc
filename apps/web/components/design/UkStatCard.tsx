import { KiIcon } from "./KiIcon";

type UkStatCardProps = {
  icon: string;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
  value: string | number;
  label: string;
  delta?: string;
  deltaDir?: "up" | "down" | "flat";
};

export function UkStatCard({
  icon,
  tone = "primary",
  value,
  label,
  delta,
  deltaDir = "up",
}: UkStatCardProps) {
  return (
    <div className="card stat">
      <div className="card-pad">
        <div className="stat-top">
          <span className={`stat-icon tone-${tone}`}>
            <KiIcon name={icon} size={22} />
          </span>
          {delta ? (
            <span className={`delta ${deltaDir}`}>
              <KiIcon name={deltaDir === "down" ? "ki-arrow-down" : "ki-arrow-up"} size={14} />
              {delta}
            </span>
          ) : null}
        </div>
        <div>
          <div className="stat-value tnum">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    </div>
  );
}
