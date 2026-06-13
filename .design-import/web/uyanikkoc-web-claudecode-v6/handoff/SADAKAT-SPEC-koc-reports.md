# SADAKAT SPEC — Koç · Raporlar (reports)

Kaynak: `src/coach-pages.jsx → CoachReportsPage`. Rota: `reports`. Veri: `useReports()`,
`COACH_STUDENTS`, `COACH_WEEK_COMPLETION`. Tam Türkçe.

## PageHead
- Başlık **`Raporlar`** · alt **`Sınıf performansı ve veli raporları`**
- Sağ aksiyon: onay bekleyen varsa birincil **`Tümünü onayla ({n})`** → toast
  **`Tüm raporlar onaylandı ve velilere gönderildi`**; yoksa `Badge` success **`Tümü onaylandı`**.

## Bileşen sırası
1. **`.grid.g-4`** — 4 StatCard (sıra birebir):
   1. `clipboard`/warning · onay bekleyen · **`Onay bekleyen rapor`**
   2. `target`/success · `%{avg}` · **`Sınıf tamamlama`**
   3. `trend`/primary · `+{Δ}` · **`Sınıf net artışı`**
   4. `alert`/danger · `{atRisk}` · **`Risk altında`**
2. **`Section` — `Sınıf Net Gelişimi`** · alt **`Tüm öğrencilerin ortalama neti`** ·
   sağda `Badge` primary **`{son} net`** → `Sparkline` (h 80).
3. **İçgörü kartları** (`.grid.g-2`, veri varsa): **`EN ÇOK GELİŞEN`** (success, trend, +net) ve
   **`İLGİ GEREKTİREN`** (danger, en düşük tamamlama) — her biri avatar + ad + **`Rapor`** butonu.
4. **`.grid.col-main`** → SOL `Section` **`Veli Raporları`** · alt **`{n} onay bekliyor`** ·
   filtreler **`Tümü`** / **`Bekleyen`** / **`Gönderilen`**.

## Veli Raporları tablosu (`.tbl`, min-width 540)
- Kolonlar: **`Öğrenci / Veli`** · **`Hafta`** · **`Tamamlama`** (renk: ≥75 yeşil, ≥50 sarı, <50 kırmızı) ·
  **`Net`** (delta ok) · **`İşlem`** (sağ): **`Görüntüle`** + (onaylı → `Badge` **`Gönderildi`** / değilse **`Onayla & Gönder`**).
- Boş filtre: **`Bu filtrede rapor yok.`**

## Sık yapılan sapmalar (YAPMA)
- ❌ ASCII: `Raporlar`, `Sınıf Net Gelişimi`, `Veli Raporları`, `Onayla & Gönder`.
- ❌ StatCard sırası/etiketleri; tamamlama renk eşiklerini (75/50) değiştirmek.
- ❌ Tablo kolon sırası / "Onayla & Gönder" akışını değiştirmek.
- ❌ İki içgörü kartını (en çok gelişen / ilgi gerektiren) atlamak.
