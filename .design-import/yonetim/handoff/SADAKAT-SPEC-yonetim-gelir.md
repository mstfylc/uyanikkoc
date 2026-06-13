# SADAKAT SPEC — Süper Admin · Gelir & Faturalama (gelir)

Kaynak: `admin/superadmin2.jsx → SARevenue`. Mod: `superadmin`, sayfa `gelir`.
Veri: `useAdmin()`, `platformMetrics()`, `orgInvoices`. Para ₺ (`TRY`). Tam Türkçe.

## PageHead
- Başlık **`Gelir & Faturalama`** · alt **`Platform genelinde tüm tahsilat, MRR/ARR ve kurum faturaları`**
- Sağ aksiyon: açık **`Faturaları indir`** (download → `faturalar.csv`).

## Bileşen sırası
1. **`.grid.g-4`** — 4 StatCard (sıra birebir):
   1. `banknote`/success · `{TRY(mrr)}` · **`Aylık gelir (MRR)`** · delta **`+%8,4`** ↑
   2. `trend`/primary · `{TRY(arr)}` · **`Yıllık gelir (ARR)`**
   3. `receipt`/info · `{TRY(collected)}` · **`Toplam tahsil edilen`**
   4. `alert`/danger · `{TRY(outstanding)}` · **`Bekleyen tahsilat`**
2. **`.grid.col-main`**:
   - SOL `Section` **`Plana göre aylık gelir dağılımı`** → `RankBars` (Franchise/Kurum Pro/Kurum Başlangıç/Bireysel koç, `TRY` biçimli).
   - SAĞ `Section` **`Tahsilat oranı`** · alt **`Bu ay`**: `Ring` (%tahsil) + legend (**`Tahsil edilen`** / **`Bekleyen`**).
3. **`Section` — `Kurum faturaları`** · alt **`Platform lisans ücretleri`**: tablo `.tbl` (min-width 700).

## Kurum faturaları tablosu — kolonlar
**`Fatura No`** · **`Kurum`** · **`Tarih`** · **`Plan`** · **`Tutar`** (sağ) · **`Durum`** (ortalı: **`Ödendi`** success / **`Bekliyor`** warning) · indir ikonu.

## YAPMA
- ❌ ASCII: `Gelir & Faturalama`, `Plana göre aylık gelir dağılımı`, `Bekleyen tahsilat`.
- ❌ StatCard sırası/etiketleri; para birimini ₺/tr-TR dışına çıkarmak.
- ❌ Tablo kolon sırası / durum rozet renkleri (Ödendi=success, Bekliyor=warning).
