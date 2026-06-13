# SADAKAT SPEC — Süper Admin · Lisans Türleri (lisans-turleri)

Kaynak: `admin/plans-packages.jsx → SAPlans` (+ `PlanCard`, plan editör). Mod: `superadmin`, sayfa `lisans-turleri`.
Veri: `orgPlans()`, `coachPlans()` (bkz. data-contracts §4–5). Tam Türkçe.

## PageHead
- Başlık **`Lisans Türleri`** · alt **`Kurum ve bireysel koç lisans planlarını, fiyatlarını, kapasitelerini ve modüllerini yönet`**
- Sağ aksiyon: birincil **`Yeni kurum lisansı`** / **`Yeni koç lisansı`** (aktif sekmeye göre) → plan editörü.

## Bileşen sırası
1. **`Tabs`**: **`Kurum Lisansları`** (building, count) · **`Koç Lisansları`** (users, count).
2. **`.grid.g-3`** — `PlanCard` kartları (aktif sekmenin planları):
   - Kurum: Başlangıç / Pro (popüler) / Franchise — aylık ₺ + seats/coaches/branches + modül sayısı.
   - Koç: Başlangıç / Pro (popüler) / Sınırsız — aylık/yıllık ₺ + seats + özellik listesi + modüller.
   - Her kartta **`Düzenle`** → plan editörü.

## YAPMA
- ❌ ASCII: `Lisans Türleri`, `Kurum Lisansları`, `Koç Lisansları`.
- ❌ Plan adlarını/fiyatlarını/kapasitelerini `data-contracts`'tan farklı yapmak (tohum değerleri birebir).
- ❌ İki sekme yapısını veya "popüler" bayrağını kaldırmak.
- ❌ AI Koç/Envanter'i alt planlara taşımak (yalnızca üst planlarda; AI Koç "Yakında" — RISKS).
