import { parseKiIconRef } from "@/lib/design/icon-paths";

import { UkIcon } from "./UkIcon";

type KiIconProps = {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

/** Metronic ki-* sınıf adlarını SVG ikona çevirir (Vercel'de font gerekmez). */
export function KiIcon({ name, size = 20, className, style }: KiIconProps) {
  const parsed = parseKiIconRef(name);
  const mergedClassName = [parsed.className, className].filter(Boolean).join(" ") || undefined;

  return <UkIcon name={parsed.icon} size={size} className={mergedClassName} style={style} />;
}
