# Component Spec — Paylaşılan Primitifler & State'ler (nav / modal / form / table)

> Kaynak: `src/styles.css`, `src/ui.jsx`. Tüm değerler birebir CSS'ten alınmıştır.
> Bu dosya v6 modüllerinin kullandığı **ortak** bileşenlerin tam state setidir.

---

## Butonlar (`.btn`)
Ortak: `border-radius:11px; font-size:13px; font-weight:700; border:1px solid transparent; transition: transform/box-shadow/background/border-color .14s`. SVG 17px. `:active { transform: translateY(1px) }`.
| Varyant | rest | hover |
|---|---|---|
| `.btn-primary` | bg `--primary`, color #fff, shadow `--shadow-primary` | bg `--primary-600`, `translateY(-1px)` |
| `.btn-light` | bg `--surface-3`, color `--text`, border `--border` | border `--border-strong` |
| `.btn-ghost` | transparan, color `--text-2` | bg `--surface-3` |
| `.btn-sm` (modifier) | height 34, padding 0 13, font 12.5, radius 9 | — |
- **disabled:** opacity 0.5 (inline) — Atama/Kaydet butonlarında.
- **icon-btn:** 40×40 (veya 36), radius 11, grid-center.

## Rozet & chip
- **`.badge`** height 23, padding 0 9, radius 7, font 11.5/700, svg 13. Varyantlar `badge-{tone}` → `{tone}-soft` bg + `{tone}` color. `badge-muted` → surface-3/muted. `badge-dot::before` 6px nokta.
- **`.chip`** height 26, padding 0 11, radius 8, font 12/700, bg surface-3, color text-2, border. `.swatch` 8×8 radius 3.

## Form kontrolleri
- **`.field`** flex-col gap 6. **`.label`** font 12/700, color text-2.
- **`.input/.select/.textarea`** height 40 (textarea auto, min 72), padding 0 12, radius 10, border `--border-strong`, bg surface, font 13.
  - **focus:** border `--primary` + `box-shadow: 0 0 0 3px var(--ring)`.
  - **placeholder:** color `--faint`.
  - **select:** custom chevron (data-uri); padding-right 32. > Not: chevron stroke kaynakta `#767A90` literal — token değil, korunabilir.
- **`.switch`** 44×26 pill, bg `--border-strong`; **`.on`** → bg `--primary` + topuz 18px sağa kayar. `.sm` küçük varyant.
- **`.stepper` (NumStepper)** 38px, surface-3 bg; buton hover surface+primary-600; input merkez, font 14/800; focus inset primary ring.

## Segment kontrol (`.seg`)
Kapsayıcı: surface-3 bg, radius 12, padding 3, border. Buton: padding 7 13, radius 9, color muted; **hover** color text; **`.on`** → bg `--surface`, color `--primary-600`, `--shadow-sm` (dark'ta color `--text`).

## Filtre butonları (`.filters button`)
height 32, radius 9, font 12.5/700, transparan + border; **hover** color text + border-strong; **`.on`** → bg `--text`, color `--surface`, border `--text` (yüksek kontrast seçili).

## Kart (`.card`) + Section
- `.card` surface bg, border, radius `--r-lg` (18px), `--shadow-sm`.
- `.card-head` padding 18 20, alt border; `h3` 14.5/700; `.sub` 12/muted.
- `.card-body` padding 20; `.card-pad` padding 22.
- `Section` (ui.jsx) = card + head(title/sub/action) + body. **Başlık sarmalayıcı `flex:1`** (v6 düzeltmesi — uzun başlık action'ı taşırmaz).

## Liste satırı (`.lrow`)
flex gap 14, padding 14 16, radius 13, border, surface bg. **hover:** border-strong + `--shadow-sm` + `translateX(2px)`. `.lr-icon` 40×40 radius 11. `.lr-title` 13.5/700. `.lr-meta` 11.5/muted, `.d::before` "·" ayraç. **`.done`:** başlık muted + line-through.
- **checkbox `.chk`** 22×22 radius 7, border-strong; **`.done`** → bg/border `--success`, ✓ beyaz. `.sm` küçük.

## Tablo (`.tbl`)
- `th`: 11px/700 uppercase, letter-spacing .04em, color faint, padding 12 16, alt border.
- `td`: padding 14 16, alt border, font 13, vertical-align middle. Son satır border yok.
- **tbody tr hover:** bg `--surface-2`.
- `.name` hücresi: avatar + b(13/700) + span(11.5/muted).
- ≤720px: th/td yatay padding 12.

## Navigasyon
### Sidebar `.nav-item`
padding 9 12, radius 10, color text-2, font 13.5/600, gap 12, svg 19 (faint).
- **hover:** bg surface-3, color text, svg text-2.
- **active:** bg `--primary-soft`, color `--primary-600`, border `color-mix(primary 16%)`, svg primary.
- **`.nav-tag`** (ör. "Yeni"/"Yakında"): warning-soft/warning pill 9.5px sağda.
- **`.nav-count`** (ör. ödev "4"): primary bg, #fff, 20px pill sağda.
- `.nav-label`: 10.5/700 uppercase faint.
- ≤880px: `min-height:44px` (dokunma hedefi).

### Topbar
height 70, sticky, z-20, bg `color-mix(--bg 78%)` + `backdrop-filter: blur(14px) saturate(140%)`, alt border. `.crumb b` 16.5/800 + span 12/muted. `.searchbox` (≤1160 gizli) surface-3, radius 11, focus-within → surface + border-strong. Rol seg (`.tb-roles`, ≤760 gizli). `icon-btn`'ler: arama / tema / `NotifBell`. `user-menu-btn` → `user-pop` (z-50).

### Bottom-nav (≤880px) `.bottom-nav`
fixed alt, z-150, role'e göre 4 ana + "Menü". `.bn-item.active` primary. `.bn-badge` sayaç. `.bn-ic` 22px.

## Modal (portal)
- **`.modal-overlay`** fixed inset 0, z-100, bg `color-mix(#0B0E18 52%)`, `animation: fade`. Tıklama → kapat.
- **`.modal-panel`** max-width 600 (her modal kendi max-width'ini inline verir: 440/470/480/520/540/560), surface, border, radius (genelde `--r-lg`/`--r-xl`), `animation: pop` (translateY 12 + scale .985 → 0). `e.stopPropagation()`.
- **`.modal-head`** padding 18 20, alt border, flex space-between (sol: `lr-icon` 38 + başlık h3 + muted alt; sağ: `icon-btn` 36 kapat = 45° döndürülmüş plus).
- **`.modal-sub`** (opsiyonel) surface-2 şerit.
- **`.modal-body`** padding 14 20, scroll, flex-col gap 8 (modal'lar inline gap override eder).
- **`.modal-foot`** padding 14 20, üst border, surface-2 bg, flex; ≤520px butonlar tam genişlik.

## Toast (`ui-actions.jsx`)
`ToastHost` portalı; `toast(text, { icon })` → sağ-alt kısa süreli bildirim (z-120). v6 aksiyonlarının çoğu toast üretir (metinler ilgili component spec'lerinde).

## Avatar
daire, `linear-gradient(140deg, --primary-300, --primary-600)`, #fff baş harf. Boyutlar 28/38/40/42. Kişiye özel avatar `meKey(auth)` ile.

## Animasyon
`.rise { animation: rise .55s }` (translateY 10→0). `prefers-reduced-motion: reduce` → kapalı. Modal `fade`+`pop`. Bar/chart geçiş `.9s–1s cubic-bezier(.22,1,.36,1)`.
