export type DenemeMembershipId = "yuzyuze" | "kargo";

export type DenemePlan = {
  id: DenemeMembershipId;
  name: string;
  mode: DenemeMembershipId;
  color: string;
  price: number;
  popular?: boolean;
  tagline: string;
  perks: string[];
  note?: string;
};

export const DENEME_PLANS: DenemePlan[] = [
  {
    id: "yuzyuze",
    name: "Yüz Yüze Deneme Paketi",
    mode: "yuzyuze",
    color: "var(--primary)",
    price: 1200,
    popular: true,
    tagline: "Kurumda gözetmenli, kağıt deneme",
    perks: [
      "Ayda 4 yüz yüze deneme",
      "Kurumda optik okuma",
      "Anında net & sıralama",
      "Salonda sınav provası deneyimi",
    ],
  },
  {
    id: "kargo",
    name: "Aylık Kargo Üyeliği",
    mode: "kargo",
    color: "var(--info)",
    price: 750,
    tagline: "Denemeler adresine gelir, online optik",
    perks: [
      "Denemeler her ay kargoyla adresine",
      "Online optik formdan giriş",
      "Net anında otomatik hesaplanır",
      "Dilediğin yerde, dilediğin saatte",
    ],
    note: "Bu üyelikte kayıt olduğun denemeleri online optik formdan doldurman gerekir.",
  },
];

export function denemePlanById(id: string | null | undefined): DenemePlan | null {
  if (!id) return null;
  return DENEME_PLANS.find((p) => p.id === id) ?? null;
}
