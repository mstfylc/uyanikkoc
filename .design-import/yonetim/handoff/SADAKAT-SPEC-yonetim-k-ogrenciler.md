# SADAKAT SPEC — Kurum Yöneticisi · Öğrenciler (k-ogrenciler) + Öğrenci Detayı (k-student-detay)

Kaynak: `admin/admin-extra4.jsx → KurumStudents` (liste) + `KurumStudentDetail`. Mod: `kurum`.
Veri: `getActiveOrg()`, `orgStudents(o)`. **Yalnızca aktif kurum**. Tam Türkçe.

## ÖĞRENCİLER (`k-ogrenciler`) — KurumStudents
- **PageHead:** başlık **`Öğrenciler`** · alt = kurum + öğrenci sayısı; CSV indir aksiyonu.
- Arama/şube filtresi + **`Section`** tablo: **`Öğrenci`** (avatar+ad) · **`Sınıf`** · **`Koç`** · **`Net`** ·
  **`Devam`** · (franchise'ta **`Şube`**). Satır tıklanır → öğrenci detay. Boş: `EmptyState`.

## ÖĞRENCİ DETAYI (`k-student-detay`) — KurumStudentDetail
- Üst: geri **`Öğrencilere dön`** + avatar + ad + sınıf/koç.
- **`.grid.g-4`** StatCard (sıra birebir):
  1. `target`/primary · `{net}` · **`Güncel net (TYT)`** · delta **`+6,2`**
  2. `checkCircle`/info · `%{attend}` · **`Devam oranı`**
  3. `trend`/success · `+%14` · **`3 aylık gelişim`**
  4. `award`/warning · Yüksek/Orta · **`Başarı seviyesi`**
- **`.grid.col-main`**:
  - SOL: `Section` **`Net gelişimi`** · alt **`Son 10 deneme`** · sağda `Badge` success **`Yükseliş`** (`Sparkline`) +
    `Section` **`Branş bazında net`**.
  - SAĞ: ek bilgi/koç kartları (kaynak yapısına göre).

## YAPMA
- ❌ ASCII: `Öğrenciler`, `Güncel net (TYT)`, `Devam oranı`, `3 aylık gelişim`, `Başarı seviyesi`.
- ❌ StatCard sırası/etiketleri; net/yüzde değerlerini `tr-TR` dışına çıkarmak.
- ❌ Başka kurumun öğrencilerini göstermek (yalnızca `getActiveOrg()` / `orgStudents`).
