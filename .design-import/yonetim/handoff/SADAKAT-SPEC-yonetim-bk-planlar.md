# SADAKAT SPEC — Bireysel Koç · Planlar & Yükselt (bk-planlar) + Faturalar (bk-faturalar)

Kaynak: `admin/coach-license.jsx → CoachPlans` + `CoachInvoices` (+ `CoachCheckout` modalı).
Mod: `coach`. Veri: `getMyCoach()`, `coachPlans()`. Tam Türkçe.

## PLANLAR & YÜKSELT (`bk-planlar`) — CoachPlans
- **PageHead:** başlık **`Planlar & Yükseltme`** · alt **`İhtiyacına göre öğrenci kapasiteni ve modüllerini seç`**.
- **Aylık/Yıllık ödeme toggle** (`pricing-toggle`).
- **Plan kartları** (Başlangıç / Pro popüler / Sınırsız — bkz. data-contracts §5): fiyat (aylık/yıllık) +
  kapasite + özellik listesi + modüller; mevcut plan işaretli, diğerinde **`Bu plana geç`** → `CoachCheckout`
  (review → pay → done; simüle ödeme — RISKS).

## FATURALAR (`bk-faturalar`) — CoachInvoices
- **PageHead:** başlık **`Faturalar`** · alt **`Lisans ödemelerin ve makbuzların`** · sağ **`CSV indir`**.
- **`.grid.g-3`** StatCard (sıra): `receipt`/primary **`Toplam fatura`** · `banknote`/success **`Ödenen tutar`** ·
  `calendar`/info **`Son ödeme`**.
- **`Section` — `Ödeme geçmişi`**: tablo (min-width 600) kolonlar **`Fatura No`** · **`Tarih`** · **`Plan`** ·
  **`Yöntem`** · **`Tutar`** (sağ) · **`Durum`** (ortalı) · indir. Boş: `EmptyState` **`Henüz fatura yok`** /
  **`İlk ödemen sonrası burada görünecek`**.

## YAPMA
- ❌ ASCII: `Planlar & Yükseltme`, `Faturalar`, `Ödeme geçmişi`, `Ödenen tutar`.
- ❌ Plan fiyat/kapasitelerini `data-contracts`'tan farklı yapmak; aylık/yıllık toggle'ı kaldırmak.
- ❌ StatCard sırası/etiketleri; para birimini ₺/tr-TR dışına çıkarmak.
