# SADAKAT SPEC — Öğrenci Dashboard (birebir yerleşim)

Kaynak: `src/student.jsx → StudentDashboard()`. Aşağıdaki sıra/yapı **birebir** uygulanır.
Tüm metinler tam Türkçe (diakritikli). Grid sınıfları `src/styles.css`'te tanımlı.

## Bileşen sırası (yukarıdan aşağıya)
1. **`.grid.col-main`** → iki sütun: `[Hero] [StreakCard]`
2. **`.grid.g-4`** → 4 adet StatCard (sıra birebir):
   1. `clock` · tone `primary` · değer `{weekHours}s` · etiket **"Bu hafta çalışma"** · delta yukarı
   2. `checkCircle` · tone `success` · değer = tamamlanan ödev · etiket **"Tamamlanan ödev"** · `+2` ↑
   3. `clipboard` · tone `warning` · değer = bekleyen · etiket **"Bekleyen görev"** · `1 gecikmiş` ↓
   4. `target` · tone `info` · değer `%{rate}` · etiket **"Haftalık tamamlama"** · `+8%` ↑
3. **`.grid.col-main`** → `[Assignments] [SubjectProgress]`
4. **`TakvimimCard`** (tam genişlik; `student-agenda.jsx`)
5. **`.grid.col-main`** → `[ExamPerformance] [UpcomingExams]`
6. **`AiBand`** (tam genişlik)

> `col-main` = ana içerik + dar yan sütun; `g-4` = 4 eşit sütun. Mobilde tek sütuna iner (styles.css).

## Hero (`.hero` — koyu degrade kart)
- Üst satır `.between` (üst hizalı): SOLDA dikey blok, SAĞDA sınıf rozeti.
  - Eyebrow: **`Günaydın 👋`** (12.5px, beyaz %78, 600)
  - Başlık `<h2>`: **`{ad}, bugün 4 görevin var`** (ada göre; `{STUDENT.name.split(" ")[0]}`)
  - Alt: **`Hedef {goal} · Koçun {coach}`** ("Hedef" ve koç adı beyaz-bold)
  - Sağ rozet: `.badge` yarı saydam beyaz, `cap` ikonu + **`{grade}`** (örn. "11. Sınıf Sayısal"), yük. 26px
- Altında **`PriorityGlass`** (cam efektli "Bugünün önceliği" şeridi):
  - Eyebrow küçük büyük-harf: **`BUGÜNÜN ÖNCELİĞİ`**
  - Başlık: en öncelikli ödevin başlığı (tek satır, taşarsa `…`)
  - Alt: **`{ders} · Son tarih {due}`**

## StreakCard (`src/student.jsx → StreakCard`)
- Üst `.between`: SOLDA `flame` ikonu (tone-warning, 38×38) + **`Çalışma Serisi`** (13.5px/700);
  SAĞDA `Badge` tone-warning, `bolt` ikon, metin **`Aktif`**.
- Orta satır (alt hizalı): büyük sayı `{STUDENT.streak}` (warning rengi, `.streak-num.tnum`) +
  yanında **`gün üst üste`** (14/700) ve altında **`Rekorun: 21 gün`** (12px, muted).
- Hafta noktaları: günler `["P","S","Ç","P","C","C","P"]`, durum `["on","on","on","on","on","today",""]`.
- En altta (mt-auto) yumuşak kutu: **`Harika gidiyorsun!`** (warning-bold) +
  ` Bugünü de tamamlarsan rekorun 13 güne çıkacak. 💪`

## Sık yapılan sapmalar (YAPMA)
- ❌ `Gunaydin`, `gorevin`, `Calisma Serisi` gibi ASCII yazım.
- ❌ Hero'da başlık/eyebrow/rozet sırasını değiştirmek; rozeti sola almak.
- ❌ StatCard sırasını/etiketlerini değiştirmek veya kart eklemek.
- ❌ `g-4` yerine 3'lü/2'li grid; `col-main` yerine eşit sütun.
- ❌ TakvimimCard'ı StatCard'ların üstüne almak; AiBand'i kaldırmak.

> Diğer roller/ekranlar için aynı disiplin: önce `src/<ilgili>.jsx`'i aç, grid sınıflarını ve
> bileşen sırasını birebir izle. Şüphede kal → prototipi tarayıcıda aç ve karşılaştır.
