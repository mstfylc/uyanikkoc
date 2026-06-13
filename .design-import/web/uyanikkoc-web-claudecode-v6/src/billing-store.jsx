/* ============================================================
   Abonelik & Ödeme store'u — planlar, abonelik durumu, faturalar,
   kayıtlı kartlar, iyzico tarzı taksit. localStorage'da kalıcı.
   B2C: veli/öğrenci koçluk paketi alır.  B2B: şube platform ücreti.
   ============================================================ */

/* ---- koçluk paketleri (B2C) — aylık + yıllık indirimli ikili ---- */
const PLANS = [
  {
    id: "standart", name: "Standart Koçluk", tagline: "Düzenli takip ve birebir koçluk",
    monthly: 1499, annual: 14990, color: "var(--info)",
    features: [
      "Haftalık birebir koçluk görüşmesi",
      "Kişiye özel haftalık çalışma programı",
      "Ödev atama ve takibi",
      "Deneme analizi ve net takibi",
      "Konu takibi paneli",
    ],
  },
  {
    id: "plus", name: "Plus Koçluk", tagline: "Aileyle birlikte tam destek", popular: true,
    monthly: 2299, annual: 22990, color: "var(--primary)",
    features: [
      "Standart paketteki her şey",
      "Veliye haftalık gelişim raporu",
      "Sınırsız mesajlaşma (koç + öğrenci)",
      "Motivasyon ve hedef takibi",
      "Önceliklendirilmiş randevu",
    ],
  },
  {
    id: "vip", name: "VIP Koçluk", tagline: "Yoğun tempo, üst düzey mentorluk",
    monthly: 3499, annual: 34990, color: "var(--warning)",
    features: [
      "Plus paketteki her şey",
      "Haftada 2 birebir görüşme",
      "Kıdemli mentor eşleştirmesi",
      "Tercih & kariyer danışmanlığı",
      "7/24 öncelikli destek hattı",
    ],
  },
];

function planById(id) { return PLANS.find((p) => p.id === id) || PLANS[0]; }

/* yıllık tasarruf (kaç ay bedava) */
function annualSavingMonths(p) { return Math.round((p.monthly * 12 - p.annual) / p.monthly); }
function planPrice(p, cycle) { return cycle === "annual" ? p.annual : p.monthly; }
function planMonthlyEq(p, cycle) { return cycle === "annual" ? Math.round(p.annual / 12) : p.monthly; }

/* ---- iyzico tarzı taksit seçenekleri (oran = vade farkı katsayısı) ---- */
const TAKSIT = [
  { n: 1, label: "Tek Çekim", rate: 0 },
  { n: 3, label: "3 Taksit", rate: 0 },
  { n: 6, label: "6 Taksit", rate: 0.04 },
  { n: 9, label: "9 Taksit", rate: 0.08 },
  { n: 12, label: "12 Taksit", rate: 0.13 },
];
function taksitTotal(amount, t) { return Math.round(amount * (1 + t.rate)); }

const TRY = (n) => "₺" + Number(n).toLocaleString("tr-TR");

/* ---- store ---- */
const BILLING_KEY = "uk_billing_v1";

function billingSeed() {
  const now = Date.now();
  const day = 86400000;
  return {
    sub: {
      planId: "plus", cycle: "annual", status: "active",
      startedAt: now - 86 * day, renewsAt: now + 279 * day,
      cardId: "c1", autoRenew: true,
    },
    cards: [
      { id: "c1", brand: "visa", last4: "4242", holder: "Ayşe Yıldız", exp: "08/27", isDefault: true },
      { id: "c2", brand: "mastercard", last4: "5571", holder: "Ayşe Yıldız", exp: "11/26", isDefault: false },
    ],
    invoices: [
      { id: "UK-2026-0312", date: now - 86 * day, planId: "plus", cycle: "annual", amount: 22990, status: "paid", method: "Visa •4242", taksit: 12 },
      { id: "UK-2025-0918", date: now - 268 * day, planId: "standart", cycle: "annual", amount: 14990, status: "paid", method: "Visa •4242", taksit: 6 },
      { id: "UK-2025-0411", date: now - 420 * day, planId: "standart", cycle: "monthly", amount: 1499, status: "paid", method: "MasterCard •5571", taksit: 1 },
    ],
  };
}

let _billing = (() => { try { const s = localStorage.getItem(BILLING_KEY); if (s) return JSON.parse(s); } catch (e) {} return billingSeed(); })();
const _bListeners = new Set();
function persistBilling() { try { localStorage.setItem(BILLING_KEY, JSON.stringify(_billing)); } catch (e) {} _bListeners.forEach((l) => l()); }

function useBilling() {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _bListeners.add(l); return () => _bListeners.delete(l); }, []);
  return _billing;
}

function subscribeTo(planId, cycle, cardId, taksitN) {
  const now = Date.now();
  const p = planById(planId);
  const amount = planPrice(p, cycle);
  const renews = now + (cycle === "annual" ? 365 : 30) * 86400000;
  const card = _billing.cards.find((c) => c.id === cardId) || _billing.cards[0];
  const inv = {
    id: "UK-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 8999)),
    date: now, planId, cycle, amount, status: "paid",
    method: (card ? (card.brand === "visa" ? "Visa" : "MasterCard") + " •" + card.last4 : "—"),
    taksit: taksitN || 1,
  };
  _billing = {
    ..._billing,
    sub: { planId, cycle, status: "active", startedAt: now, renewsAt: renews, cardId: card ? card.id : null, autoRenew: true },
    invoices: [inv, ..._billing.invoices],
  };
  persistBilling();
  return inv;
}

function setAutoRenew(on) { _billing = { ..._billing, sub: { ..._billing.sub, autoRenew: on } }; persistBilling(); }
function cancelSubscription() { _billing = { ..._billing, sub: { ..._billing.sub, status: "canceled", autoRenew: false } }; persistBilling(); }
function resumeSubscription() { _billing = { ..._billing, sub: { ..._billing.sub, status: "active", autoRenew: true } }; persistBilling(); }

function addCard(card) {
  const id = "c" + Date.now();
  const isFirst = _billing.cards.length === 0;
  const c = { ...card, id, isDefault: isFirst };
  _billing = { ..._billing, cards: [..._billing.cards, c] };
  persistBilling();
  return id;
}
function removeCard(id) {
  let cards = _billing.cards.filter((c) => c.id !== id);
  if (cards.length && !cards.some((c) => c.isDefault)) cards = cards.map((c, i) => ({ ...c, isDefault: i === 0 }));
  _billing = { ..._billing, cards };
  persistBilling();
}
function setDefaultCard(id) { _billing = { ..._billing, cards: _billing.cards.map((c) => ({ ...c, isDefault: c.id === id })) }; persistBilling(); }

Object.assign(window, {
  PLANS, TAKSIT, TRY, planById, annualSavingMonths, planPrice, planMonthlyEq, taksitTotal,
  useBilling, subscribeTo, setAutoRenew, cancelSubscription, resumeSubscription,
  addCard, removeCard, setDefaultCard,
});
