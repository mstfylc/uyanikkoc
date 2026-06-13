# SADAKAT SPEC — Süper Admin · Raporlar (raporlar)

Kaynak: `admin/sa-reports.jsx → SAReports` (+ RptRevenue/RptGrowth/RptUsage/RptLicense). Mod: `superadmin`, sayfa `raporlar`.
Veri: `platformMetrics()`, `useAdmin()`. `RPT_PERIODS`, `RPT_TABS`. Tam Türkçe. Para ₺.

## PageHead
- Başlık **`Raporlar`** · alt **`Platform genelinde gelir, büyüme, kullanım ve lisans sağlığı raporları`**
- Sağ aksiyonlar: dönem `.seg` (`RPT_PERIODS`) + birincil **`Raporu indir (CSV)`**.

## Sekmeler (`Tabs` — `RPT_TABS`, sıra birebir)
**`Gelir`** · **`Büyüme`** · **`Kullanım`** · **`Lisans Sağlığı`** (shield).

### Gelir (RptRevenue)
`.grid.g-4`: `banknote`/success **`Aylık gelir (MRR)`** (+%8,4) · `trend`/primary **`Yıllık gelir (ARR)`** ·
`wallet`/info **`Abone başına gelir (ARPU)`** · `alert`/danger **`Bekleyen tahsilat`**.
`.grid.col-main`: **`Gelir gelişimi (MRR)`** (Sparkline) + **`Tahsilat oranı`** (Ring). Sonra
**`Aylık satış / tahsilat`** (BarChart) + **`Plana göre aylık gelir`** (RankBars).

### Büyüme (RptGrowth)
`.grid.g-4`: `building` **`Toplam kurum`** · `users` **`Bireysel koç`** · `bell` **`Demo talebi`** ·
`trend` **`Dönüşüm (demo → ücretli)`**. + **`Yeni katılan aboneler`** / **`Abone dağılımı`** (Donut) +
**`Demo talep hunisi`** / **`Şehir bazında abone`**.

### Kullanım (RptUsage)
`.grid.g-4`: `cap` **`Toplam öğrenci`** · `building` **`Toplam şube`** · `chart` **`Ort. koltuk doluluğu`** ·
`star` **`Ort. koç puanı`**. + **`Modül benimseme`** / **`Koltuk doluluğu`** (Ring) + **`En çok öğrencisi olan kurumlar`**.

### Lisans Sağlığı (RptLicense)
`.grid.g-4`: `shield` **`Aktif lisans`** · `clock` **`Süresi doluyor`** · `alert` **`Ödeme gecikti`** ·
`banknote`/danger **`Risk altındaki gelir`**. + **`Lisans durumu dağılımı`** (Donut) + **`Yaklaşan yenilemeler`**.

## YAPMA
- ❌ ASCII: `Raporlar`, `Lisans Sağlığı`, `Abone başına gelir (ARPU)`, `Risk altındaki gelir`.
- ❌ 4 sekme sırasını/etiketlerini veya her sekmenin StatCard sırasını değiştirmek.
- ❌ Para/yüzde/öğrenci değerlerini `tr-TR`/₺ dışına çıkarmak.
