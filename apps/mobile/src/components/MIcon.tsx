import Svg, { Circle, Path, Polygon, Polyline, Rect } from "react-native-svg";

const ICONS: Record<string, React.ReactNode> = {
  home: (
    <>
      <Path d="M3 10.5 12 3l9 7.5" />
      <Path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
      <Path d="M9.5 21v-6h5v6" />
    </>
  ),
  clipboard: (
    <>
      <Rect width="8" height="4" x="8" y="2" rx="1.5" />
      <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <Path d="M9 13l2 2 4-4" />
    </>
  ),
  chart: (
    <>
      <Path d="M3 3v18h18" />
      <Rect x="7" y="11" width="3" height="6" rx="1" />
      <Rect x="12.5" y="7" width="3" height="10" rx="1" />
      <Rect x="18" y="13" width="3" height="4" rx="1" />
    </>
  ),
  calendar: (
    <>
      <Rect width="18" height="18" x="3" y="4" rx="2.5" />
      <Path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  user: (
    <>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  bell: (
    <>
      <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>
  ),
  flame: (
    <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  ),
  book: (
    <>
      <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ),
  notebook: (
    <>
      <Path d="M2 6h4M2 10h4M2 14h4M2 18h4" />
      <Rect x="6" y="3" width="16" height="18" rx="2" />
      <Path d="M16 3v18" />
    </>
  ),
  message: <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  heart: (
    <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  ),
  chevronRight: <Polyline points="9 18 15 12 9 6" />,
  chevronLeft: <Polyline points="15 18 9 12 15 6" />,
  mail: (
    <>
      <Rect width="20" height="16" x="2" y="4" rx="2.5" />
      <Path d="m2.5 6 9.5 6 9.5-6" />
    </>
  ),
  phone: (
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  shield: (
    <>
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <Polyline points="9 12 11 14 15 10" />
    </>
  ),
  clock: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Polyline points="12 7 12 12 16 14" />
    </>
  ),
  target: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Circle cx="12" cy="12" r="5" />
      <Circle cx="12" cy="12" r="1.5" />
    </>
  ),
  logout: (
    <>
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Polyline points="16 17 21 12 16 7" />
      <Path d="M21 12H9" />
    </>
  ),
  settings: (
    <>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  star: (
    <Polygon points="12 2.5 14.85 8.26 21.2 9.18 16.6 13.66 17.69 19.99 12 17 6.31 19.99 7.4 13.66 2.8 9.18 9.15 8.26" />
  ),
  check: <Polyline points="20 6 9 17 4 12" />,
  checkCircle: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Polyline points="9 12 11 14 15 10" />
    </>
  ),
  chevronDown: <Polyline points="6 9 12 15 18 9" />,
  arrowUp: (
    <>
      <Path d="m5 12 7-7 7 7" />
      <Path d="M12 19V5" />
    </>
  ),
  arrowDown: (
    <>
      <Path d="m19 12-7 7-7-7" />
      <Path d="M12 5v14" />
    </>
  ),
  trend: (
    <>
      <Polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <Polyline points="16 7 22 7 22 13" />
    </>
  ),
  plus: (
    <>
      <Path d="M5 12h14" />
      <Path d="M12 5v14" />
    </>
  ),
  award: (
    <>
      <Circle cx="12" cy="8" r="6" />
      <Path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.11" />
    </>
  ),
  moon: <Path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  help: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <Path d="M12 17h.01" />
    </>
  ),
  send: (
    <>
      <Path d="m22 2-7 20-4-9-9-4Z" />
      <Path d="M22 2 11 13" />
    </>
  ),
  play: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Polygon points="10 8 16 12 10 16 10 8" />
    </>
  ),
  edit: (
    <>
      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </>
  ),
  refresh: (
    <>
      <Path d="M21 2v6h-6" />
      <Path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <Path d="M3 22v-6h6" />
      <Path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </>
  ),
  users: (
    <>
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  ai: (
    <>
      <Path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5Z" />
      <Path d="M19 21H5a2 2 0 0 1-2-2v-1a7 7 0 0 1 14 0v1a2 2 0 0 1-2 2Z" />
    </>
  ),
  bolt: <Path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
};

type MIconProps = {
  name: keyof typeof ICONS | string;
  size?: number;
  color?: string;
  fill?: boolean;
  strokeWidth?: number;
};

export function MIcon({ name, size = 22, color = "#181A24", fill = false, strokeWidth = 2 }: MIconProps) {
  const content = ICONS[name] ?? ICONS.home;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? color : "none"} stroke={fill ? "none" : color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {content}
    </Svg>
  );
}
