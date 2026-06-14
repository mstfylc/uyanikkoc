# PARITE — UI port kanıt durumu

Son güncelleme: 2026-06-14 (§2a Türkçe/ikon grep)

| Ekran / modal | Referans | Durum | Kanıt |
|---------------|----------|-------|-------|
| Ödev Ata modal (`CoachOdevAtaModal`) | `coach-odev-ata.jsx` + `odev-ata.css` | **senkron** | Playwright: `e2e/coach-student-parent.spec.ts` → "koç ödev oluşturur, öğrenci görür ve tamamlar" (2026-06-14, yeşil). Toplu atama: `/coach/assignments/create` → konu seç → `POST /api/coach/assignments {studentIds, items}` → öğrenci listesinde görünür. |
| `/coach/assignments/create` | modal-first (jenerik form kaldırıldı) | **senkron** | Aynı e2e; `Toplu Ödev Ata` başlığı + `.oa-sheet` |
| Koç ödev listesi (`CoachAssignmentsPanel`) | prototip ödev listesi | **senkron** | `Geçen hafta` + `görev` düzeltildi; §2a grep `Gecen\|gorev` canlı UI'da boş |
| Koç dashboard Türkçe | `coach-dashboard.jsx` | **senkron** | Manuel tarama + Faz 1 |
| Student / parent / shared / appointments / admin Türkçe | prototip `.jsx` | **senkron** | ASCII Türkçe Faz 3 (2026-06-14) |

## §2a — tam-ağaç Türkçe / ikon grep (2026-06-14)

```text
# Gecen|gorev — apps/web/app + apps/web/components (api + demo-flow hariç)
→ boş (CoachAssignmentsPanel düzeltmesi sonrası)

# lucide|heroicons|keenicons|react-icons|@fortawesome|feather
→ boş

# Geniş ASCII pattern (api + demo-flow hariç)
→ yalnız kod kimlikleri (Odev*, studentSinav, setOdevModal vb.); görünen UI metni eşleşmesi: Sidebar `Lisansim` (bu commit kapsamı dışı)
```

## Notlar

- `defaultAll` toplu atama sayfasında ve filtre "Tümü" modunda varsayılan: tüm öğrenciler seçili.
- `components/demo-flow/*` kullanılmıyor (ölü kod); e2e yeni modala güncellendi.
