import { resolveKiIcon } from "@/lib/design/icon-paths";

import { UkIcon } from "./UkIcon";

type KiIconProps = {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

/** Metronic ki-* sınıf adlarını SVG ikona çevirir (Vercel'de font gerekmez). */
export function KiIcon({ name, size = 20, className, style }: KiIconProps) {
  return <UkIcon name={resolveKiIcon(name)} size={size} className={className} style={style} />;
}
