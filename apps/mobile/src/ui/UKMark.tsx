/* Marka glyph'i (web logo.jsx ile aynı geometri). */
export function UKMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: "#fff" }}>
      <path d="M7 8.5 V13 a5 5 0 0 0 10 0 V8.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M12 2.2 C12.5 4.1 13.2 4.8 15 5.3 C13.2 5.8 12.5 6.5 12 8.4 C11.5 6.5 10.8 5.8 9 5.3 C10.8 4.8 11.5 4.1 12 2.2 Z"
        fill="currentColor"
      />
    </svg>
  );
}
