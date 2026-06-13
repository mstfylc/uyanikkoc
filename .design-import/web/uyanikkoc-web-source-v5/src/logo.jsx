/* Uyanık Koç logosu — "U" beşiği + yükselen kıvılcım (uyanış + yükseliş).
   currentColor ile çizilir; .logo-mark içinde beyaz görünür.
   full=true verildiğinde kendi gradyan rozetiyle (stand-alone) render eder. */

function UKLogoGlyph({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* U beşiği — açık kupa */}
      <path d="M7 8.5 V13 a5 5 0 0 0 10 0 V8.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* yükselen kıvılcım */}
      <path d="M12 2.2 C12.5 4.1 13.2 4.8 15 5.3 C13.2 5.8 12.5 6.5 12 8.4 C11.5 6.5 10.8 5.8 9 5.3 C10.8 4.8 11.5 4.1 12 2.2 Z" fill="currentColor" />
    </svg>
  );
}

function UKLogo({ size = 40, radius }) {
  const r = radius == null ? Math.round(size * 0.28) : radius;
  const gid = "ukg-" + Math.round(size);
  return (
    <span style={{ width: size, height: size, borderRadius: r, display: "grid", placeItems: "center", flexShrink: 0, background: "linear-gradient(140deg, var(--primary), var(--primary-700, #3a318f))", color: "#fff", boxShadow: "var(--shadow-primary)" }}>
      <UKLogoGlyph size={Math.round(size * 0.56)} />
    </span>
  );
}

Object.assign(window, { UKLogo, UKLogoGlyph });
