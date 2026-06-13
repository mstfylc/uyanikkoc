# SADAKAT SPEC — Mobil · Denemeler (denemeler)

Kaynak: `mobile/uk-screens2.jsx → DenemelerScreen`. PNG: `exports/mobil/ios-light/denemeler.png`.
Tab: **Denemeler**. Native: ScrollView + pull-to-refresh. Tam Türkçe.

## Bileşen sırası (mevcut v3)
1. **Net trendi grafiği** (son denemeler).
2. **Deneme geçmişi:** liste (ad + tip + tarih + net + delta), satır → detay.
3. **`Deneme kaydet`** CTA (sonuç gir).

## v6 EKLENECEK
- **Sekmeler:** **`Sonuçlar`** / **`Analiz`** / **`Online Deneme`** (web `exams`).
- **Net Kaybı Haritası kartı** (her sekme üstünde): en yüksek net kazançlı alanlar + **`Programa ekle`** — web `net-gain-map`.
- **Analiz:** içe aktarılan deneme analizi; **Online:** online deneme çöz (optik).

## YAPMA
- ❌ ASCII: `Denemeler`, `Net Kaybı Haritası`, `Sonuçlar/Analiz/Online`.
- ❌ Net trendini kaldırmak; tabloyu yatay tablo yapmak (mobilde kart/liste).
- ❌ NetGainMap'i atlamak (v6 hedefi).
