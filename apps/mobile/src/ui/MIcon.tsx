import type { CSSProperties } from "react";
import { ICONS, type IconName } from "./icons";

interface MIconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  fill?: boolean;
  style?: CSSProperties;
  className?: string;
}

export function MIcon({ name, size = 22, stroke = 2, fill = false, style, className }: MIconProps) {
  const d = ICONS[name] ?? "";
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
      dangerouslySetInnerHTML={{ __html: d }}
    />
  );
}
