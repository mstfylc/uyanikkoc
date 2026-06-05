import { UK_ICON_PATHS, type UkIconName } from "@/lib/design/icon-paths";

type UkIconProps = {
  name: UkIconName;
  size?: number;
  stroke?: number;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export function UkIcon({ name, size = 20, stroke = 2, fill = false, className, style }: UkIconProps) {
  const path = UK_ICON_PATHS[name] ?? UK_ICON_PATHS.dashboard;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: path }}
    />
  );
}
