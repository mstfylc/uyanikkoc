# Badge

Durum/etiket rozeti (renk tonlu, opsiyonel ikon/nokta). Kaynak: `src/styles.css` (`.badge*`).

## Props
| prop | değerler | açıklama |
|---|---|---|
| `tone` | `primary` \| `success` \| `warning` \| `danger` \| `info` \| `muted` | renk |
| `icon` | ikon adı (ops.) | sol ikon 12–13px |
| `dot` | boolean | canlı nokta (yanıp sönen) |

## Ölçüler (token referansı)
- Yükseklik: 23px (varsayılan) — `sm` 21px
- Padding: `0 spacing-3` (9px)
- Radius: `radius-sm` → `.badge` 7px
- Font: `typography.badge` (11.5px / 700)
- Renk: bg `tone-soft`, text `tone` (örn. `success-soft` / `success`)

## State'ler (zorunlu)
| state | görünüm |
|---|---|
| **default** | ton-soft bg + ton text |
| **hover** | yok (statik etiket); tıklanabilir filtre rozetinde `border-strong` |
| **active** | filtre rozetinde seçili: bg `primary.500` + text #fff |
| **focus** | tıklanabilirse `ring` |
| **disabled** | `opacity:.5` (filtre devre dışı) |
| **error** | `tone="danger"` |
| **loading** | yok |

## Metronic karşılığı
Metronic `badge badge-light-{tone}` ile birebir; `dot` = `badge` + canlı `pulse` animasyonu.
