# Token → CSS Değişkeni Eşleme Tablosu (token-css-map)

> Kaynak: `indir/uyanikkoc-web-source-v5/src/styles.css` · `tokens.json`
> Bu tablo, tasarım tokeni adlarını **kanonik CSS değişkenlerine** ve bileşen kullanımına eşler.
> Codex hedef projede (apps/web) bu CSS değişkenlerini `app/globals.css` veya `styles/uk-design.css` içinde **birebir** tanımlamalıdır. Tema değişimi `<html data-theme="dark">` ile yapılır.

## 1. Çözümleme zinciri
`token (JSON) → CSS değişkeni → component class → DOM`
Örn: `brand.primary` → `--primary` → `.btn-primary { background: var(--primary) }` → `<button class="btn btn-primary">`

## 2. Renk eşlemesi
| Token (colors.json) | CSS değişkeni | Light | Dark |
|---|---|---|---|
| brand.primary | `--primary` | #534AB7 | #8079E6 |
| brand.primary-600 | `--primary-600` | #463DA6 | #6E66D6 |
| brand.primary-700 | `--primary-700` | #3A3290 | #5E56C4 |
| brand.primary-300 | `--primary-300` | #8E87D6 | #A39CF0 |
| brand.primary-soft | `--primary-soft` | #EEEDF9 | #232238 |
| brand.primary-glow | `--primary-glow` | rgba(83,74,183,.28) | rgba(128,121,230,.30) |
| semantic.success | `--success` | #0F6E56 | #34D399 |
| semantic.success-soft | `--success-soft` | #E4F1EC | #14271F |
| semantic.warning | `--warning` | #B26A12 | #F0B45E |
| semantic.warning-soft | `--warning-soft` | #FAEFDE | #2A2113 |
| semantic.danger | `--danger` | #A32D2D | #F87171 |
| semantic.danger-soft | `--danger-soft` | #F8E8E8 | #2C1818 |
| semantic.info | `--info` | #2F6BD6 | #6BA0F0 |
| semantic.info-soft | `--info-soft` | #E6EEFA | #141E2E |
| neutral.bg | `--bg` | #F4F5FA | #0B0E18 |
| neutral.bg-grad-a | `--bg-grad-a` | #F1F1FA | #0C0F1B |
| neutral.bg-grad-b | `--bg-grad-b` | #F6F6FB | #0A0D16 |
| neutral.surface | `--surface` | #FFFFFF | #181C2B |
| neutral.surface-2 | `--surface-2` | #FAFAFD | #1F2435 |
| neutral.surface-3 | `--surface-3` | #F3F4F9 | #282E43 |
| neutral.border | `--border` | #E8E9F2 | #2E3450 |
| neutral.border-strong | `--border-strong` | #DCDEEA | #3C4366 |
| neutral.text | `--text` | #181A24 | #F3F4FB |
| neutral.text-2 | `--text-2` | #45485A | #C9CDDF |
| neutral.muted | `--muted` | #6B6F85 | #969BB4 |
| neutral.faint | `--faint` | #A2A6B8 | #6E7391 |
| neutral.ring | `--ring` | rgba(83,74,183,.16) | rgba(128,121,230,.22) |

> **Dikkat:** v4 → v5/v6 arasında değişen tek değer: `--muted` light = `#767A90` → **`#6B6F85`**. Doğru değer `#6B6F85`'tir.

## 3. Boyut / efekt eşlemesi
| Token | CSS değişkeni | Değer |
|---|---|---|
| radius.sm/md/lg/xl | `--r-sm` / `--r-md` / `--r-lg` / `--r-xl` | 9 / 13 / 18 / 24 px |
| shadow.sm/md/lg/primary | `--shadow-sm` / `--shadow-md` / `--shadow-lg` / `--shadow-primary` | bkz. radius-shadow-zindex.json |
| layout.sidebar-w | `--sidebar-w` | 264px (mobil 0) |
| layout.header-h | `--header-h` | 70px |
| typography.sans | `--font` | Plus Jakarta Sans stack |

## 4. tone → renk çifti (component sözleşmesi)
Component'ler renk değil **tone** taşır. `tone` → `(ana, soft)` çiftine çözülür:
| tone | ana | soft | Kullanım |
|---|---|---|---|
| primary | `--primary` | `--primary-soft` | `.badge-primary`, `.stat-icon.tone-primary` |
| success | `--success` | `--success-soft` | `.badge-success`, durum: Kapandı/Onaylandı |
| warning | `--warning` | `--warning-soft` | `.badge-warning`, durum: Açık/Bekliyor |
| danger | `--danger` | `--danger-soft` | `.badge-danger`, durum: Gecikti/Reddedildi |
| info | `--info` | `--info-soft` | `.badge-info`, durum: Tekrar edildi |
| muted | `--muted` | `--surface-3` | nötr rozet/chip |

CSS deseni:
```css
.badge-success { color: var(--success); background: var(--success-soft); }
.stat-icon.tone-success { color: var(--success); background: var(--success-soft); }
```

## 5. Ders rengi (JS sabiti — CSS değişkeni DEĞİL)
`SUBJECT_COLORS[ders]` (colors.json → subjects) doğrudan inline `style={{ background: c }}` veya `color-mix(in srgb, ${c} 14%, transparent)` olarak kullanılır. Tema bağımsızdır. Hedef projede `lib/design` altında bir sabit obje olarak taşıyın.

## 6. Geçiş notları (Codex için)
- Tüm değişkenleri `:root` (light) ve `[data-theme="dark"]` blokları olarak **birebir** kopyalayın.
- `--surface` dark bloğunda kaynakta iki kez yazılmıştır (`#14172380` sonra `#181C2B`); **geçerli olan ikincisidir: `#181C2B`**. İlk satırı taşımayın.
- `color-mix()` ve `radial-gradient()` kullanımları korunmalı (özellikle `.app` arka plan gradyanı ve ikon arka planları).
- rem'e geçiş opsiyoneldir; geçerseniz 16px taban; yarım-px metin boyutlarını koruyun.
