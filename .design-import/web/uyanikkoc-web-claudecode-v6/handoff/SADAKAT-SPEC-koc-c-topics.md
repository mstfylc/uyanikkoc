# SADAKAT SPEC — Koç · Konu Takibi (c-topics)

Kaynak: `src/coach-konu.jsx → CoachKonuPage`. Rota: `c-topics`. Veri: `useRoster()`, `COACH_STUDENTS`,
`konu-store`. Mount edilen modüller: `NetGainMap`, `CoachMistakesCard`, `HataFrekansiCard`,
`StudentNotesCard`, `OdevAtaModal`. Bu ekran **veri-yoğun** — sıra birebir korunmalı. Tam Türkçe.

## PageHead
- Başlık **`Konu Takibi`** · alt **`Öğrencinin ders bazında konu ilerlemesi, çözülen soru ve net gelişimi`**
- Sağ aksiyonlar: **öğrenci seçici** select (`{ad} · {sınıf} · {sınav}`) + birincil **`Ödev Ata`** (plus) → `OdevAtaModal`.

## Bileşen sırası (yukarıdan aşağıya — birebir)
1. **Öğrenci şeridi** (`.card`): avatar (52) + ad + sınav rozeti + `{sınıf} · Hedef: YKS 2026 · KAMP ÜS programı`;
   sağda **`Okul Programı`** butonu + `RiskDot` + son aktivite rozeti (clock).
2. **`NetGainMap` role="coach"** — Net Kaybı Haritası; her fırsatta **`Bu konuya ödev ata`** → `openAta(subject, topic)`.
3. **`CoachMistakesCard`** — `Section` **`Öğrencinin Yanlış Defteri`** · alt **`Açık yanlışlar — konuya göre
   doğrudan ödev atabilirsin`** · sağda `Badge` danger **`{n} açık`** (+ tekrar bekleyen). Her grup satırında **`Ödev ata`**.
4. **`HataFrekansiCard` role="coach"** — `Section` **`Hata Frekansı`** · alt **`{öğrenci} · son 14 gün`**.
5. **`.grid.g-4`** — 4 StatCard (sıra birebir):
   1. `book`/primary · `%{overallPct}` · **`Genel konu tamamlama`**
   2. `checkCircle`/success · `{done}/{total}` · **`Tamamlanan konu`**
   3. `notebook`/info · çözülen soru (`toLocaleString('tr-TR')`) · **`Çözülen soru`**
   4. `trend`/warning · `+{totalGain}` · **`Net gelişimi (TYT+AYT)`** (LGS ise **`Net gelişimi (LGS)`**)
6. **`StudentNotesCard`** — öğrenci notları (görüşme/uyarı/övgü; sabitlenebilir).
7. **`Section` — `Net Gelişimi`** · alt **`Başlangıç → Son net (TYT / AYT)`** (LGS: `(Sayısal / Sözel)`) —
   liste/grafik görünümü.
8. **Müfredat ısı haritası** — `WEEKS` hafta segmenti + ders×konu kareleri (haftalık ilerleme).
9. **`Section` — `Deneme Analizleri`** · alt **`En çok yanlış yapılan konular`** · sağda `Badge` danger
   **`{n} zayıf konu`** — zayıf konu listesi.
10. **`Section` — `Soru Takibi`** · alt = `{hafta} · günlük çözülen soru` / **`Son 4 hafta çözülen soru`** ·
    sağda segment **`Haftalık`** / **`Aylık`** + hafta navigasyonu → bar grafik (toplam/ortalama/zirve).

## Sık yapılan sapmalar (YAPMA)
- ❌ ASCII: `Konu Takibi`, `Öğrencinin Yanlış Defteri`, `Çözülen soru`, `Net Gelişimi`.
- ❌ Yukarıdaki 10'lu sırayı bozmak; NetGainMap/CoachMistakesCard/HataFrekansi üçlüsünü atlamak.
- ❌ StatCard sırası/etiketleri; "Net gelişimi" etiketinin sınav türüne göre (TYT+AYT / LGS) değişmesini kaldırmak.
- ❌ Öğrenci seçici + "Ödev Ata" başlık aksiyonlarını kaldırmak.
- ❌ Çözülen soru sayısını `toLocaleString('tr-TR')` yerine düz sayı yazmak.
