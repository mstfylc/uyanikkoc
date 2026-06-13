# SADAKAT SPEC — Mobil · Ödevler (odevler)

Kaynak: `mobile/uk-screens.jsx → OdevlerScreen` + `ResultSheet`. PNG: `exports/mobil/ios-light/odevler.png`.
Tab: **Ödevler** (rozet: bekleyen sayısı). Native: FlatList + pull-to-refresh. Tam Türkçe.

## Bileşen sırası
1. **Hafta seçici** (yatay) — haftalar arası geçiş.
2. **Ödev listesi:** her satır ders + konu + durum (bekliyor/tamamlandı/gecikmiş) + **`Sonuç Gir`**.
3. **ResultSheet (bottom-sheet):** D/Y/B girişi → canlı **net** (`max(0, D−Y/4)`) → kaydet.

## v6 EKLENECEK
- **Görünüm segmenti:** **`Günlük plan`** / **`Liste`** / **`Takvim`** (varsayılan Günlük plan) — web `assignments`.
- **Sonuç → Yanlış Defteri köprüsü:** yanlış varsa kaydetme sonrası **MistakeBatch bottom-sheet** (toplu yanlış→defter).

## YAPMA
- ❌ ASCII: `Sonuç Gir`, `Günlük plan`, `Gecikmiş`.
- ❌ Net formülünü değiştirmek; sonuç girişini modal yerine sayfa yapmak (bottom-sheet).
- ❌ v6'da varsayılanı Liste yapmak (Günlük plan).
