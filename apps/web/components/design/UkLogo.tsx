type UkLogoGlyphProps = {
  size?: number;
  className?: string;
};

/** Uyanık Koç logosu — U beşiği + yükselen kıvılcım (logo.jsx birebir). */
export function UkLogoGlyph({ size = 22, className }: UkLogoGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7 8.5 V13 a5 5 0 0 0 10 0 V8.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M12 2.2 C12.5 4.1 13.2 4.8 15 5.3 C13.2 5.8 12.5 6.5 12 8.4 C11.5 6.5 10.8 5.8 9 5.3 C10.8 4.8 11.5 4.1 12 2.2 Z"
        fill="currentColor"
      />
    </svg>
  );
}

type UkLogoProps = {
  size?: number;
  radius?: number;
};

/** Stand-alone gradyan rozet + glyph (logo.jsx UKLogo). */
export function UkLogo({ size = 40, radius }: UkLogoProps) {
  const r = radius == null ? Math.round(size * 0.28) : radius;

  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: r,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        background: "linear-gradient(140deg, var(--primary), var(--primary-700, #3a318f))",
        color: "#fff",
        boxShadow: "var(--shadow-primary)",
      }}
    >
      <UkLogoGlyph size={Math.round(size * 0.56)} />
    </span>
  );
}
