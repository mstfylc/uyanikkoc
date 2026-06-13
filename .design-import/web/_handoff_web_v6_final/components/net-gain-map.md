# Component Spec — Net Kaybı Haritası (NetGainMap)

> Kaynak: `src/net-gain-map.jsx` → `NetGainMap({ student, sinav, role, onPick })`
> Stiller: `.ngm-head`, `.ngm-cards`, `.ngm-card`, `.ngm-rank`, `.ngm-gain`, `.ngm-levers`, `.ngm-factors`, `.ngm-list`, `.ngm-row` (`src/styles.css` ~1255–1272)
> Mount: Öğrenci **Denemeler** (`exams`), Koç **Konu Takibi** (`c-topics`), Veli **Genel Bakış** (`dashboard`, salt-görüntüleme).

## Konsept
"En hızlı net artışı nereden gelir?" — gerçek sinyallerden ders/konu fırsat sıralaması:
- konu tamamlanma açığı (konu-store) · Yanlış Defteri yanlış/boş ağırlığı (kapanmamış) · deneme trendi · hedef nete katkı.

## Yapı
`Section`:
- **title** "Net Kaybı Haritası"
- **sub** "En hızlı net kazancı veren alanlar — tamamlanma açığı, yanlış/boş ağırlığı ve deneme trendi birlikte"
- **action** `Badge success` icon `bolt` → "≈ +{totalNet} net potansiyel"

Card-body (flex col, gap 16):
1. **`.ngm-head`** — bolt ikon + manşet cümle: "En hızlı net artışı şu alanlardan gelir: **{top1}**, **{top2}**, **{top3}**." (`_ngmPhrase` ile, lever sure/kalite ise "· {short}" eklenir).
2. **`.ngm-cards`** (3 kolon, ≤760px tek kolon) — top 3 `.ngm-card` (üst kenar rengi = ders rengi):
   - `.ngm-rank` (sıra no), band etiketi (TYT/AYT), ders adı (renk swatch) + konu.
   - **`.ngm-gain`** — büyük "+{estNet}" + "net potansiyel".
   - **`.ngm-levers`** — lever badge (`konu`/`kalite`/`sure`/`tekrar`) + trend ("▲ çıkıyor"/"▬ yatay"/"▼ düşüyor", renk success/warning/danger) + (varsa) "{n} yanlış" rozeti (Yanlış Defteri'nden).
   - **`.ngm-factors`** — 3 mini bar: "Tamamlanma açığı", "Yanlış / boş", "Net açığı" (dolum genişliği ders renginde).
   - **CTA (role'e göre):**
     - `coach` → `btn btn-light btn-sm ngm-cta` "Bu konuya ödev ata" → `onPick(area)` (OdevAtaModal'ı konu+ders önyüklü açar).
     - `student` → "Programa ekle" → toast + `uk-nav → schedule`.
     - `parent` → **CTA yok.**
3. **`.ngm-list` (Sıradaki fırsatlar)** — `rest` (max 5) satırları: ders swatch + konu·ders + ince bar (`gain`) + lever badge + "+{estNet}"; coach'ta satır sonunda `mini-btn` (ödev ata).
4. Alt muted not: "v1 — tamamlanma, yanlış/boş ve trend sinyallerinden hesaplanır. **v2**'de ÖSYM katsayıları, bölüm hedefi ve sıralama tahmini eklenecek."

## Sinyal mantığı (özet)
- `accuracy` ← konu tamamlanma yüzdesi + deterministik hash; **kapanmamış yanlışlar doğruluğu düşürür** (`-min(24, n*4)`).
- `gain = 0.30·compGap + 0.28·wrongWeight + 0.18·netGapNorm + 0.14·trendPen + mkBoost` (0–100).
- `estNet = gain/100 · (maxNet/9) · 1.15` (1 ondalık).
- `lever`: yanlış varsa baskın hata tipi → `NGM_ERR_LEVER` (bilgi→konu, islem→kalite, sure/dikkat→sure/sure, yorum→kalite, unutma→tekrar); yoksa konu durumu/doğruluk/trend.
- Çeşitlilik: top 3'te aynı dersten en fazla 1 alan.

## Durum
- `top` boşsa component **null** döner (hiç render etmez).
- Veli: tamamen salt-görüntüleme (hiçbir aksiyon butonu yok).

## Bağımlılıklar
`getCurriculum(sinav)`, `konuList`, `ensureKonuSeed` (konu-store), `getMistakes` (mistakes-store), `SUBJECT_COLORS`, `NGM_MAXNET` ders→max net tablosu.
