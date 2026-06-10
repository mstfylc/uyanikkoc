# StatCard

Üst-düzey metrik kartı (ikon + değer + etiket + opsiyonel delta). Kaynak: `src/styles.css` (`.stat*`, `.card`).

## Props
| prop | değerler | açıklama |
|---|---|---|
| `icon` | ikon adı | sol üst ikon çipi |
| `tone` | `primary` \| `success` \| `warning` \| `danger` \| `info` | ikon çipi rengi |
| `value` | string/number | büyük sayı (`typography.stat`, 30px/800) |
| `label` | string | açıklama (`text.muted`, 12.5px) |
| `delta` | string (ops.) | değişim rozeti |
| `deltaDir` | `up` \| `down` | delta rengi (up=success, down=danger) |

## Ölçüler (token referansı)
- Kart: `radius-lg`, `shadow-sm`, padding `spacing-9` (22px), bg `surface.surface`, border `border.border`
- İkon çipi: 44×44, `radius-md`, bg `tone-soft`, ikon `tone` 22px
- Değer: `typography.stat`; etiket `typography.caption`

## State'ler (zorunlu)
| state | görünüm |
|---|---|
| **default** | statik kart |
| **hover** | tıklanabilir ise `shadow-md` + `translateY(-2px)`; salt-bilgi ise değişim yok |
| **active** | tıklanabilir varyantta hafif `scale(.99)` |
| **focus** | tıklanabilir ise `box-shadow: 0 0 0 3px var(--ring)` |
| **disabled** | yok (bilgi kartı) |
| **error** | `tone="danger"` + ikon `alert`; değer kırmızı vurgulanır |
| **loading** | değer yerine `skeleton` blok (bg `surface-3`, shimmer), ikon çipi nötr |

## Metronic karşılığı
Metronic istatistik widget'ı (`card` + `symbol` ikon + `fs-2hx` değer) ile eşlenir.
