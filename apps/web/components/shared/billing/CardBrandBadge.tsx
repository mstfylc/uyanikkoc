type CardBrandBadgeProps = {
  brand: "visa" | "mastercard";
  size?: "sm" | "md";
};

const CARD_BRAND = {
  visa: { label: "VISA", bg: "#1a1f71", fg: "#fff", italic: true },
  mastercard: { label: "MC", bg: "#1a1a1a", fg: "#fff", italic: false },
} as const;

export function CardBrandBadge({ brand, size = "md" }: CardBrandBadgeProps) {
  const b = CARD_BRAND[brand] ?? CARD_BRAND.visa;
  const h = size === "sm" ? 18 : 24;
  return (
    <span
      style={{
        display: "inline-grid",
        placeItems: "center",
        height: h,
        minWidth: h * 1.55,
        padding: "0 7px",
        borderRadius: 5,
        background: b.bg,
        color: b.fg,
        fontSize: size === "sm" ? 9.5 : 11.5,
        fontWeight: 800,
        letterSpacing: ".04em",
        fontStyle: b.italic ? "italic" : "normal",
      }}
    >
      {b.label}
    </span>
  );
}
