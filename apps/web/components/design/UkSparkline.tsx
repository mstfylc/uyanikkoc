type UkSparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
};

export function UkSparkline({
  data,
  width = 320,
  height = 64,
  color = "var(--primary)",
  fill = true,
}: UkSparklineProps) {
  if (data.length === 0) {
    return null;
  }

  const max = Math.max(...data) * 1.12;
  const min = Math.min(...data) * 0.88;
  const span = max - min || 1;
  const points = data.map((value, index) => {
    const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
    const y = height - ((value - min) / span) * height;
    return [x, y] as const;
  });

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point[0].toFixed(1)},${point[1].toFixed(1)}`)
    .join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const gradientId = `spk-${points.length}-${data[data.length - 1]}`;

  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: "100%", height }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.26" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill ? <path d={area} fill={`url(#${gradientId})`} /> : null}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {points.map((point, index) =>
        index === points.length - 1 ? (
          <circle
            key={index}
            cx={point[0]}
            cy={point[1]}
            r="3.5"
            fill={color}
            stroke="var(--surface)"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        ) : null,
      )}
    </svg>
  );
}
