# SADAKAT SPEC — Süper Admin · Genel Bakış (genel)

Kaynak: `admin/superadmin.jsx → SAOverview`. Mod: `superadmin`, sayfa `genel`.
Veri: `useAdmin()`, `platformMetrics()`. Tam Türkçe. Para ₺ (`TRY`).

## PageHead
- Başlık **`Platform Genel Bakış`** · alt **`Uyanık Koç — tüm kurumlar, koçlar ve abonelik geliri tek ekranda`**
- Sağ aksiyonlar: açık **`Dışa aktar`** (download → `platform-ozet.csv`); birincil **`Kurumları yönet`** (building → `goto('kurumlar')`).

## Bileşen sırası
1. **`.grid.g-4`** — 4 StatCard (sıra birebir, delta dahil):
   1. `building`/primary · `{orgs}` · **`Kurum / Franchise`** · delta **`{n} franchise`** ↑
   2. `users`/info · `{activeCoaches}` · **`Aktif bireysel koç`** · **`{n} toplam`** ↑
   3. `cap`/success · `{students}` (`toLocaleString('tr-TR')`) · **`Toplam öğrenci`** · **`+184 / ay`** ↑
   4. `banknote`/warning · `{TRY(mrr)}` · **`Aylık gelir (MRR)`** · **`+%8,4`** ↑
2. **`.grid.col-main`**:
   - SOL `Section` **`Gelir gelişimi (MRR)`** · alt **`Son 12 ay · ₺ bin`** · sağda `Badge` success **`ARR {TRY(arr)}`**:
     `Sparkline` (12 nokta) + altında 3 KPI: **`Kurum gelirleri`** / **`Bireysel koç gelirleri`** / **`Tahmini yıllık (ARR)`**.
   - SAĞ `Section` **`Abone dağılımı`**: `Donut` (Franchise/Tek kurum/Bireysel koç, merkez = toplam abone) + legend.
3. **Lisans uyarı şeridi** (`.alert-strip.warn`, `atRisk>0` ise): **`{n} lisans dikkat gerektiriyor`** +
   **`Süresi dolan, ödemesi geciken veya dondurulmuş lisanslar var.`** + **`Lisans takibine git`** (→ `lisanslar`).
4. **`.grid.col-main`**:
   - SOL `Section` **`Yaklaşan yenilemeler`** · alt **`Lisans bitiş tarihine göre`** · sağda **`Tümü`** link:
     `.list-row` (OrgLogo/Avatar + ad + tür·ücret + sağda kalan gün renkli + tarih). İlk 6, tarihe göre sıralı.
   - SAĞ `Section` **`Bu ay yeni katılan`** · alt **`Kurum ve franchise`**: `BarChart` + 3 KPI satırı
     (**`Dönüşüm (deneme → ücretli) %62`** · **`Aylık kayıp (churn) %1,8`** · **`Ortalama kurum büyüklüğü 164 öğrenci`**).

## Renk kodu (kalan gün)
`dl<0` danger · `dl<14` warning · değilse normal. Status: active=success, expiring=warning, trial=info, overdue=danger.

## YAPMA
- ❌ ASCII: `Platform Genel Bakış`, `Gelir gelişimi`, `Abone dağılımı`, `Yaklaşan yenilemeler`.
- ❌ StatCard sırası/etiketleri/delta'ları; öğrenci/MRR sayılarını `tr-TR`/₺ dışına çıkarmak.
- ❌ Alert-strip mantığını (atRisk>0) veya iki col-main satır düzenini bozmak.
- ❌ Yeni metrik uydurmak (churn/dönüşüm/ortalama değerleri prototiple aynı).
