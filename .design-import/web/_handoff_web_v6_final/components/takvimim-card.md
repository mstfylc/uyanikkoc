# Component Spec — Takvimim (TakvimimCard)

> Kaynak: `src/student-agenda.jsx` → `TakvimimCard`
> Stiller: `.ag-*` (`src/styles.css` ~1300–1339)
> Mount: Öğrenci **Dashboard**.

## Amaç
Ödev + yaklaşan deneme + randevu + Sıfır Hata tekrarlarını **tek takvimde** birleştirir. Tüm veri gerçek store'lardan.

## Veri birleştirme (`_agBuild(me)`)
Her kaynak `{ date, kind, title, sub, time?, color, icon, page }` item'ına çevrilir:
- **odev** ← `getOdevler()` (bana ait, `status!=="done"`, due var) · page `assignments` · icon = ödev türü ikonu · renk = ders rengi.
- **deneme** ← `STUDENT_EXAMS_UP` · page `exams` · icon `chart` · renk `var(--<tone>)`.
- **randevu** ← `getAppts()` (bana ait, reddedilmemiş/iptal değil) · page `appointments` · icon mode ikonu · renk `var(--success)`.
- **tekrar** ← `dueMistakes(me)` (max 8) · page `mistakes` · icon `ai` · renk `var(--warning)`.
Her item'a `diff` (bugüne gün farkı) eklenir; tarih + tür ile sıralanır.
`AG_KINDS`: odev(primary,clipboard) · deneme(info,chart) · randevu(success,calendar) · tekrar(warning,ai).

## Yapı
`Section`:
- **title** "Takvimim", **sub** "Randevu, deneme, ödev ve tekrarların tek takvimde".
- **action** seg (34px): **Ajanda** (clipboard) / **Hafta** (calendar) / **Ay** (notebook).

Card-body:
- **Filtre şeridi** `.ag-filters`: "Tümü {n}" + her tür için (sayısı>0) "{tür} {n}" buton (aktif `.on`).
- **Görünüm** (state `view`):

### Ajanda (`AgAgenda`)
`diff ∈ [-14, 45]` penceresi; günlere/`overdue` grubuna böler. Grup başlığı `.ag-ghead`: "Gecikmiş"(`.od`) / "Bugün"(`.td`) / "Yarın" / tam tarih. Satırlar `AgRow` — `.ag-ic` (color-mix arka), başlık+sub, sağda tür badge + saat. Tıklama → `uk-nav` ilgili sayfaya. Boş: "Yaklaşan kayıt yok 🎉".

### Hafta (`AgWeek`)
Pazartesi başlangıçlı 7 gün kolonu; `.ag-nav` ile hafta ileri/geri + "Bugün". Her kolon `.ag-wk-col` (bugün `.today`), başlık (kısa gün + tarih), gün item'ları `AgChip` (sol kenar = renk, ikon + başlık + saat). ≤640px yatay kaydırmalı.

### Ay (`AgMonth`)
6×7 (42 hücre) ızgara; `.ag-nav` ay ileri/geri + "Bugün". Hücre `.ag-mo-cell` (ay-dışı `.out`, bugün `.today`, seçili `.sel`): gün no + tür noktaları (`.ag-mo-dots`, max 4, renk = tür tone) + "{n}" sayısı. Hücre seçince alt panel `.ag-mo-day` → seçili günün `AgRow` listesi (boşsa "Bu gün için kayıt yok.").

## Bağımlılıklar
`getOdevler`/`useOdevler`, `STUDENT_EXAMS_UP`, `getAppts`/`useAppts`, `APPT_MODE`/`APPT_STATUS`, `dueMistakes`/`useMistakes`, `HATA_TIPI`, `ODEV_TYPES`, `SUBJECT_COLORS`. Demo "bugün": `MIS_TODAY = 2026-06-05`.
