# Components — Extra (kalan tasarım sistemi component'leri)

> Not: Zaman/kapsam kararıyla ("bitir / atla") kalan 13 primitive tek dosyada toplandı. Her biri tüm state'leriyle. Kaynak: `src/styles.css` + `src/ui.jsx`. Ölçü/renk token referansıdır.

State sözlüğü (hepsi için): **default / hover / active / focus / disabled / error / loading**.

## Avatar
Baş harf / hazır ikon / foto. 38–76px daire. Props: `name`, `size`, `avatarKey`, `tone`, `src`.
- default: gradient(`primary.300`→`primary.600`) + baş harf #fff · hover (tıklanabilir): hafif `scale(1.04)` · active: `scale(.97)` · focus: `ring` · disabled: `opacity .5` · error: yok · loading: nötr `surface-3` daire.

## Section
Başlık + alt yazı + opsiyonel action + `card-body`. Props: `title`, `sub`, `action`.
- default: `card` (`radius-lg`, `shadow-sm`, border `border`) · hover/active/focus: yok (kapsayıcı) · error: başlıkta `tone="danger"` rozet · loading: gövde skeleton.

## Tabs (seg-tab)
Yatay sekme şeridi. Props: `tabs[]`, `active`, `onChange`, `count`.
- default: nötr text-muted · hover: `surface-3` bg · active(on): bg `surface`, text `primary.600`, `shadow-sm` · focus: `ring` · disabled: `opacity .4` · loading: yok.

## Meter
Etiketli ilerleme çubuğu. Props: `label`, `used`, `total`, `unit`, `unlimited`.
- bar dolum rengi: <75% `primary`, ≥75% `warning`, ≥92% `danger`. State'ler statik; animasyonla dolum (loading: 0'dan animasyon).

## Donut
SVG yüzde dilimleri. Props: `slices[]`, `size`, `stroke`, `center`. Statik; hover'da dilim vurgusu opsiyonel; loading: gri tam halka.

## Sparkline
Alan grafiği (sayı dizisi). Props: `data[]`, `w`, `h`, `color`, `fill`. Statik; son nokta işaretli; loading: düz çizgi.

## Bar (mini)
Tek satır ilerleme. Props: `value` (0–100), `color`, `thin`. default/loading aynı yapı; renk eşiklere göre.

## Modal
`modal-overlay` (z-index `modal`=100, blur) + `modal-panel` (`radius-lg`, `shadow-lg`). Props: `title`, `sub`, `width`, `foot`.
- default: ortalı panel · focus: ilk alana otomatik odak + `ring` · disabled (foot butonları): `opacity .5` · error: alan içi hata mesajı · loading: foot butonunda spinner. Overlay tıklaması veya ✕ ile kapanır.

## Field + Input/Textarea
Etiket + kontrol. Props: `label`, `placeholder`, `type`.
- default: border `border-strong`, h=40, `radius-md` 11px · hover: border `primary.300` · focus: border `primary` + `box-shadow ring` · disabled: bg `surface-3`, `opacity .6` · **error**: border `danger` + altta `danger` mesaj · loading: input içi nötr skeleton.

## Select
`.select` — Input ile aynı ölçü/state; sağda chevron. error/disabled aynı.

## Switch
Aç/kapa. Props: `on`, `onClick`.
- default off: track `surface-3` · on: track `primary.500` · hover: hafif parlaklık · focus: `ring` · disabled: `opacity .5` · loading: yok.

## Chip
Küçük etiket/seçim. Props: `icon`, `swatch`, seçili.
- default: bg `surface-3`, h≈22–30, `radius-pill` · hover: `border-strong` · active(seçili): bg `primary.500` text #fff · focus: `ring` · disabled: `opacity .5`.

## OdevCard
Ödev satırı (`.lrow`): ders rengi şerit + başlık + meta + aksiyon. Props: `o` (ödev), `onResult`.
- default: nötr satır · done: soluk + ✓ rozet · overdue: tarih `danger` · hover: `surface-2` · focus (buton): `ring` · loading: skeleton satır.

## Metronic eşlemesi
Tümü Metronic temel sınıflarına eşlenir (badge/btn/card/form-control/form-switch/symbol). Özel grafik primitive'leri (Donut/Sparkline/Meter) prototip SVG'sinden birebir taşınır.
