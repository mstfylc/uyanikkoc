# Button

Tüm buton varyantları tek spec'te. Kaynak: `src/styles.css` (`.btn*`). Renk/ölçü çıplak değer değil token referansıdır.

## Varyantlar (props)
| prop | değerler | açıklama |
|---|---|---|
| `variant` | `primary` \| `light` \| `danger` \| `ghost-danger` | görsel stil |
| `size` | `md` (varsayılan) \| `sm` | yükseklik |
| `icon` | ikon adı (opsiyonel) | metnin solunda 14–16px |
| `disabled` | boolean | etkisiz + opaklık |

## Ölçüler (token referansı)
- Yükseklik: `md` = 40px, `sm` = 32px
- Padding (md): `0 spacing-6` (17px yatay)
- Radius: `radius-md` (13px) → `.btn` 11px; `sm` `radius-sm`
- Font: `typography.body-sm` (13px / weight 700)
- Geçiş: transform/box-shadow/background 140ms

## Renkler (token)
- `primary`: bg `primary.500` (#534AB7), text `#fff`, hover `primary.600`
- `light`: bg `surface-3`, text `text-2`, border `border`
- `danger`: bg `semantic.danger`, text `#fff`
- `ghost-danger`: bg yok, text `semantic.danger`, hover bg `danger-soft`

## State'ler (zorunlu — hepsi)
| state | görünüm |
|---|---|
| **default** | varyant rengi, `shadow` yok (primary'de hafif) |
| **hover** | primary: `primary.600` + `shadow-primary`; light: bg `surface` + `border-strong`; ghost-danger: bg `danger-soft` |
| **active** | `transform: translateY(1px)` / `scale(.98)`, gölge azalır |
| **focus** | `box-shadow: 0 0 0 3px var(--ring)` (focus-visible) |
| **disabled** | `opacity: .5`, `cursor: not-allowed`, hover yok |
| **error** | yok (buton hata state'i taşımaz; form alanı taşır) |
| **loading** | metin yerine spinner/ikon dönüşü, buton `disabled` gibi, genişlik korunur |

## Metronic karşılığı
Metronic `btn btn-primary / btn-light / btn-danger` ile birebir eşlenir; özel `ghost-danger` = `btn-link` + danger renk.
