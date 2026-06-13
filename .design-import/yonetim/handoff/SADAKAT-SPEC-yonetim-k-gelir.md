# SADAKAT SPEC — Kurum Yöneticisi · Gelir & Tahsilat (k-gelir)

Kaynak: `admin/kurum2.jsx → KurumRevenue`. Mod: `kurum`, sayfa `k-gelir`.
Veri: `getActiveOrg()`. `isFr = type === "franchise"`. Para ₺. Tam Türkçe.

## PageHead
- Başlık **`Gelir & Tahsilat`** · alt: franchise **`Hangi şubeden ne kazandığını şube şube takip et`** /
  tek kurum **`Öğrenci aboneliklerinden gelen tahsilat ve platform ücreti`** · sağ: **`CSV indir`** (`gelir-sube.csv`).

## Bileşen sırası
1. **`.grid.g-4`** — 4 StatCard (sıra birebir):
   1. `banknote`/success · `{TRY(totalCollect)}` · **`Aylık brüt tahsilat`** · delta **`+%6,2`** ↑
   2. `card`/danger · `{TRY(platformFee)}` · **`Platform ücreti`**
   3. `wallet`/primary · `{TRY(net)}` · **`Net gelir`**
   4. `cap`/info · `{TRY(öğrenci başına)}` · **`Öğrenci başına`**
2. **Franchise ise** `Section` **`Şube bazında gelir`** · alt **`En çok kazandıran: {x} · öğrenci başına lider: {y}`** ·
   sağda sıralama segmenti (**`Tahsilat`** / öğrenci başına) — şube tablosu.
3. **`.grid.col-main`**:
   - SOL `Section` **`Aylık tahsilat gelişimi`** · alt **`Son 6 ay`** (`Sparkline`).
   - SAĞ `Section` **`Tahsilat dağılımı`**: `Donut` (net kâr vs platform ücreti, merkez = %net kâr) + legend.

## YAPMA
- ❌ ASCII: `Gelir & Tahsilat`, `Aylık brüt tahsilat`, `Platform ücreti`, `Net gelir`, `Öğrenci başına`.
- ❌ StatCard sırası/etiketleri; franchise şube tablosunu tek kurumda göstermek.
- ❌ Para birimini ₺/tr-TR dışına çıkarmak.
