# SADAKAT SPEC — Öğrenci · Çalışma Programı (schedule)

Kaynak: `src/student-pages.jsx → SchedulePage` (+ `AddBlockModal`). Rota: `schedule`.
Tüm metinler tam Türkçe. `localStorage` durumu: blok başlat/bitir/ekle anlık state.

## PageHead
- Başlık **`Çalışma Programı`** · alt **`Koçunla planladığın haftalık çalışma takvimi`**
- Sağ aksiyonlar (`.row` gap 8):
  - Segment (`.seg`): **`Gün`** (calendar ikon) | **`Hafta`** (dashboard ikon) — varsayılan `Gün`
  - Birincil buton: **`Çalışma bloğu ekle`** (plus ikon) → `AddBlockModal`

## GÜN görünümü (view="day")
1. Gün segmenti (`.seg`, sarmalı): SCHEDULE günleri (Pzt…); bugünde küçük primary nokta.
   Sonda **`Tüm hafta`** (dashboard ikon) → Hafta görünümüne geçer.
2. **`.grid.col-main`**:
   - SOL `Section`: başlık = `DAYS_FULL[day]` (örn. "Cumartesi") · alt = **`{n} çalışma bloğu`** ·
     bugünse sağda `Badge` primary dot **`Bugün`**. Gövde: `BlockCard` listesi (gap 8).
   - SAĞ `.stack`:
     - `.grid.g-2` iki StatCard: `clock`/primary **`{totalH}s` · "Bu hafta plan"**;
       `calendar`/info **`{sessions}` · "Toplam blok"**
     - `Section` **`Haftalık Çalışma`** · alt **`Günlük tamamlanan saat`** → `BarChart` (max 6, peakIdx 5)
3. Altta tam genişlik: `SchoolScheduleEditor` (okul ders programı) + `SchoolExams` (editable).

### BlockCard (`.lrow`)
- Sol: saat bloğu — `b.t` (kalın) üstte, `b.e` (muted) altta, ortalı, min 50px.
- Ders renk şeridi (4px, `SUBJECT_COLORS[subj]`).
- Orta: `.lr-title` = `b.topic`; `.lr-meta` = ders chip (swatch+ad) · tür · varsa kaynak (book ikon) ·
  varsa `{count} soru · {d}D {y}Y · net {…}`.
- Sağ durum: tamamlanmış → `Badge` success **`Bitti`**; devam → `Badge` warning **`Devam ediyor`** +
  birincil **`Bitir`**; aksi → açık buton **`Başla`**.
- Etkileşim toast'ları: başla → `"{konu}" başladı — kolay gelsin!`; bitir → `"{konu}" tamamlandı ✓`.

## HAFTA görünümü (view="week")
- `Section` **`Haftanın Tümü`** · alt **`Tüm haftalık çalışma programın tek bakışta`** ·
  sağda `Badge` muted **`{sessions} blok`**.
- İçerik: takvim ızgarası (`.wk-cal`, min-width 760, yatay kaydırılır): saat sütunu + gün sütunları,
  bloklar konumlandırılmış (`.wk-block`), bugün sütunu vurgulu. Bloklar tıklanınca başla/bitir.

## AddBlockModal (`Çalışma Bloğu Ekle`)
- Başlık **`Çalışma Bloğu Ekle`** · alt **`{Gün} programına`** · sağ üst kapat (plus 45° döndürülmüş).
- Alanlar: **Başlangıç/Bitiş** (time, yan yana) · **Ders** (select, müfredattan) ·
  **Kaynak (kitabın)** (select, opsiyonel; kaynak yoksa ipucu metni) · **Konu / başlık** (input, autofocus) ·
  **Tür** chip'leri: `Soru çözümü` · `Konu tekrarı` · `Deneme` · `Video ders`.
- Soru çözümü/Deneme seçilince: **Soru / Doğru / Yanlış** (numeric); canlı **Boş** ve **Net** gösterimi;
  D+Y > Soru ise hata: **`Doğru + yanlış, soru sayısını aşamaz.`**
- Footer: **`Vazgeç`** · **`Ekle`** (konu ≥2 karakter ve tutarlıysa aktif).

## Sık yapılan sapmalar (YAPMA)
- ❌ ASCII: `Calisma Programi`, `Tum hafta`, `gun`. Tam Türkçe kullan.
- ❌ Gün/Hafta segmentini kaldırmak veya sırasını değiştirmek.
- ❌ Sağ sütundaki 2 StatCard + BarChart düzenini tek sütuna indirmek (masaüstünde `col-main`).
- ❌ BlockCard durum mantığını (Başla→Devam ediyor→Bitir→Bitti) basitleştirmek.
- ❌ Net hesabını değiştirmek: `net = max(0, doğru − yanlış/4)`.
