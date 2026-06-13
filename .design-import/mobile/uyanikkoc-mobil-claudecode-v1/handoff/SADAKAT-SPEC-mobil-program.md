# SADAKAT SPEC — Mobil · Program (program)

Kaynak: `mobile/uk-screens2.jsx → ProgramScreen`. PNG: `exports/mobil/ios-light/program.png`. Tab: **Program**.
Native: gün seçici + blok listesi, pull-to-refresh. Tam Türkçe.

## Bileşen sırası
1. **Gün seçici** (yatay; bugün vurgulu).
2. **Günlük ders programı** — blok görünümü (saat + ders + konu, ders rengi şeridi).

## v6 hizalama
Web `schedule`'da Gün/Hafta + `.wk-cal` ızgarası var; mobilde **Gün** odaklı + opsiyonel hafta
özeti (native'de tam ızgara yerine kaydırılabilir gün/hafta segmenti). Çalışma bloğu ekleme **bottom-sheet**.

## YAPMA
- ❌ ASCII: `Program`, gün adları (Pzt/Sal…).
- ❌ Ders rengi şeridini/blok yapısını kaldırmak.
