type UkBarChartPoint = {
  label: string;
  value: number;
};

type UkBarChartProps = {
  data: UkBarChartPoint[];
  peakIdx?: number;
  max?: number;
  gradient?: boolean;
};

export function UkBarChart({ data, peakIdx, max, gradient = false }: UkBarChartProps) {
  if (data.length === 0) {
    return (
      <p className="muted" style={{ fontSize: 13 }}>
        Trend icin yeterli deneme yok.
      </p>
    );
  }

  const top = max ?? Math.max(...data.map((point) => point.value), 1);
  const highlightIndex = peakIdx ?? data.length - 1;

  return (
    <div className="chart">
      {data.map((point, index) => (
        <div key={`${point.label}-${index}`} className={`col${index === highlightIndex ? " peak" : ""}`}>
          <div className="track">
            <div
              className={`fill${gradient ? " gradient" : ""}`}
              style={{ height: `${(point.value / top) * 100}%` }}
              title={String(point.value)}
            />
          </div>
          <label>{point.label}</label>
        </div>
      ))}
    </div>
  );
}
