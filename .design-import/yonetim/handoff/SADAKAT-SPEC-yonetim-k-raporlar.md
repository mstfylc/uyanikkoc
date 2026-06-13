# SADAKAT SPEC — Kurum Yöneticisi · Raporlar (k-raporlar)

Kaynak: `admin/kurum2.jsx → KurumReports`. Mod: `kurum`, sayfa `k-raporlar`.
Veri: `getActiveOrg()`, `orgStudents`, `orgCoaches`. `REPORT_PERIODS`. Tam Türkçe.

## PageHead
- Başlık **`Raporlar`** · alt **`{şube/kurum adı} · {dönem}`**
- Sağ aksiyonlar: kapsam select (kurum/şube) + dönem select (**`Son 30 gün`** / **`Bu dönem`** /
  **`Son 3 ay`** / **`Tüm zamanlar`**).

## Sekmeler (`Tabs`)
**`Akademik`** · **`Finansal`** · **`Koç/operasyon`** (kaynak sırası).

### Akademik
- `.grid.g-4` StatCard: `target`/success **`Ortalama net`** (+4,1) · `checkCircle`/info **`Devam oranı`** ·
  `cap`/primary **`Öğrenci`** · `alert`/danger **`Risk altında`**.
- `.grid.col-main`: `Section` **`Net dağılımı`** · alt **`Başarı bantlarına göre öğrenci`** (`Donut`) +
  `Section` **`Branş bazında ortalama net`** (`RankBars` + devam oranı `Meter`).

### Finansal
- `.grid.g-4` StatCard: `banknote`/success **`Aylık tahsilat`** · `card`/warning **`Platform ücreti`** ·
  `trend`/primary **`Net gelir`** · `cap`/info **`Öğrenci başına`**.
- `Section` **`Tahsilat gelişimi`** · alt **`{dönem} · ₺ bin`** (`Sparkline`); franchise'ta
  `Section` **`Şube bazında tahsilat`** · alt **`Aylık karşılaştırma`** (`RankBars`).

## YAPMA
- ❌ ASCII: `Raporlar`, `Ortalama net`, `Net dağılımı`, `Branş bazında ortalama net`.
- ❌ Dönem seçeneklerini (`REPORT_PERIODS`) veya sekme setini değiştirmek; StatCard sıralarını bozmak.
- ❌ Para/yüzde/net değerlerini `tr-TR`/₺ dışına çıkarmak.
