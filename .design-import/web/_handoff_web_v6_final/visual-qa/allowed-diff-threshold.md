# Görsel QA — İzin Verilen Fark Eşiği (allowed-diff-threshold)

> Pixel-perfect hedefi pragmatik tanımlar. Karşılaştırma: hedef `apps/web` çıktısı ↔ kanonik prototip (canlı) ve `exports/*` PNG referansları.

## Yöntem
- Araç: pixelmatch / Playwright `toHaveScreenshot` (ya da Chromatic).
- Her rota × 4 varyant (desktop-light/dark @1440×, mobile-light/dark @390×) yakalanır.
- Aynı demo veri (bu paketteki seed / data-contracts örnek payload'ları) ve aynı "bugün" sabitleri (2026-06-05) ile.
- Fontlar tam yüklenmiş, animasyonlar bitmiş (reduced-motion açık) durumda yakalanır.

## Eşikler
| Kapsam | Eşik (farklı piksel oranı) | Not |
|---|---|---|
| Tasarım sistemi (renk/typografi/radius/shadow) | **%0 tolerans** | token değerleri birebir eşleşmeli; renk farkı kabul edilmez |
| Layout / hizalama / boşluk | **≤ %1.0** | sub-piksel font render + tarayıcı farkı payı |
| Tipografi metrikleri | **≤ %1.5** | Plus Jakarta Sans yüklü; fallback render farkı tolere |
| Tüm sayfa (genel) | **≤ %2.0** | anti-aliasing + gölge yumuşaması |
| Gölge/gradyan/blur (topbar backdrop, hero, ikon arka) | **≤ %3.0** | backdrop-filter tarayıcıya göre değişir |

## Per-piksel ayarı (pixelmatch)
- `threshold: 0.1` (0–1, renk hassasiyeti).
- `includeAA: false` (anti-aliasing sayma).
- Maskele: dinamik/zaman bağlı alanlar (saat damgaları, "x dk önce", canlı "yazıyor…", rastgele avatar gradyanı tohumu).

## Sayılmayan (kabul edilen) farklar
- Saat/tarih/"x önce" metinleri (gerçek zamanlı).
- Mesaj otomatik-yanıt simülasyonu (backend'de yok).
- Scrollbar görünümü (OS/tarayıcı).
- 1px sub-piksel font baseline kaymaları.
- Emoji glyph render farkı (OS).

## SIFIR tolerans (mutlaka birebir)
- Renk tokenları (hex/rgba) — özellikle `--muted #6B6F85`, `--surface dark #181C2B`.
- Hata tipi / durum / lever / tone → renk eşlemeleri.
- Ders renkleri (SUBJECT_COLORS).
- Buton/badge/segment seçili stilleri.
- Toast ve boş-durum **metinleri** (Türkçe birebir).
- Spaced-repetition aralıkları 1→3→7→21.

## Başarı kriteri
Bir rota "kabul" sayılır: 4 varyantın tümü ilgili eşiğin altında **ve** SIFIR-tolerans kalemlerinin hiçbiri ihlal edilmemiş **ve** acceptance-checklist'teki ilgili maddeler işaretli.
