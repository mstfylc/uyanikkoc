# Web tasarım referansı (v6)

Kaynak: "Uyanık Koç — Web" v6 final görsel handoff (Claude bundler).
Hedef: `apps/web/` (Next.js App Router).

## Klasörler

- `uyanikkoc-web-claudecode-v6/` — **kanonik kaynak (doğruluk kaynağı)** + sadakat sözleşmesi.
  React+Babel SPA, tüm rol/ekranların JSX'i + `src/styles.css` + `tokens.json`.
  Yeni dokümanlar: `CLAUDE.md` (kalıcı talimat), `handoff/SADAKAT-SPEC-ogrenci-dashboard.md`
  (birebir yerleşim spec'i), `handoff/TEKNIK-REHBER-ve-VERI-MODELI.md` (veri modeli + build).
  (Kaynak `src/*.jsx` içeriği eski v5 ile birebir aynıdır; yalnızca dokümanlar güncellendi.)
- `_handoff_web_v6_final/` — v6 görsel handoff paketi:
  - `tokens/` — renk/tipografi/spacing/radius-shadow-zindex (token-css-map.md ile)
  - `components/` — v6 modül + primitif spec'leri
  - `flows/` — uçtan uca akışlar
  - `data-contracts/` — alan/enum/payload/yetki sözleşmeleri
  - `source-map/` — kaynak ↔ `apps/web` rota/dosya/komponent eşlemesi
  - `visual-qa/` — kabul checklist + izinli diff eşiği
  - `exports/` — gerçek ekran PNG'leri (3 rol × light/dark, masaüstü)

## Okuma sırası

`_handoff_web_v6_final/manifest.json` → `README.md` → `RISKS_AND_GAPS.md` →
`tokens/` → `source-map/` → `components/` → `flows/` → `data-contracts/` →
`visual-qa/` → `exports/`.

## Eksik görseller (tasarım eksikliği değil, yakalama ortamı kısıtı)

`RISKS_AND_GAPS.md A` ve `exports/README.md`:
- mobil PNG'ler (mobile-light/dark)
- modal PNG'leri (SmartOdev, MistakeAdd/Batch, ZeroErrorReview, CoachNote, Group)
- PNG'i olmayan masaüstü ekranlar (schedule, appointments, tests, settings, profile, c-topics, ...)

Bunlar gerçek Chrome + DevTools ile `exports/README.md` adımlarıyla üretilebilir.
Spec/kod tam mevcut olduğundan uygulama için bloklayıcı değildir.

## Uygulama önceliği

İlk faz: yalnızca **PNG referansı olan** ekranlar pixel-perfect yapılır —
student(dashboard, mistakes, exams, assignments, topics, messages),
coach(dashboard, c-assignments, students, messages, reports),
parent(dashboard, p-exams, messages).
