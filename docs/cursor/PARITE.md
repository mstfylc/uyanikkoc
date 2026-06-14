# PARITE — UI port kanıt durumu

Son güncelleme: 2026-06-14 (§2a v2 tam-ağaç Türkçe kapanışı)

| Ekran / modal | Referans | Durum | Kanıt |
|---------------|----------|-------|-------|
| Ödev Ata modal (`CoachOdevAtaModal`) | `coach-odev-ata.jsx` + `odev-ata.css` | **senkron** | Playwright: `e2e/coach-student-parent.spec.ts` → "koç ödev oluşturur, öğrenci görür ve tamamlar" (2026-06-14, yeşil). Toplu atama: `/coach/assignments/create` → konu seç → `POST /api/coach/assignments {studentIds, items}` → öğrenci listesinde görünür. |
| `/coach/assignments/create` | modal-first (jenerik form kaldırıldı) | **senkron** | Aynı e2e; `Toplu Ödev Ata` başlığı + `.oa-sheet` |
| Koç ödev listesi (`CoachAssignmentsPanel`) | referans HTML yok | **senkron** | Prototipte ayrı panel yok; kanıt = §2a grep + e2e yeşil (`Sonuç girilen`, `Gecikmiş`, `Sonuçlu`, `Geçen hafta`, `görev`) |
| Veli denemeler (`ParentExamsPanel`) | prototip | **senkron** | `Deneme Sonuçları` başlığı düzeltildi |
| Koç dashboard Türkçe | `coach-dashboard.jsx` | **senkron** | Manuel tarama + Faz 1 |
| Student / parent / shared / appointments / admin Türkçe | prototip `.jsx` | **senkron** | ASCII Türkçe Faz 3 + v2 tam tarama (2026-06-14) |

## §2a — tam-ağaç Türkçe / ikon grep (v2, 2026-06-14)

```text
# ASCII-Türkçe sapmalar (apps/web/app + components, api/ hariç)
→ görünen UI metni temiz (Lisansım, Sonuç*, Gecikmiş, Özet*, demo-flow ölü kod dahil)

# Geniş pattern sonrası kalan eşleşmeler
→ yalnız doğru Türkçe UI (Kaydet, Detay, Tamamla, Tamamlama, Gecikti) veya kod kimlikleri (studentSinav, *Odev*Modal)

# lucide|heroicons|keenicons|react-icons|@fortawesome|feather
→ boş
```

## Notlar

- `defaultAll` toplu atama sayfasında ve filtre "Tümü" modunda varsayılan: tüm öğrenciler seçili.
- `components/demo-flow/*` kullanılmıyor (ölü kod); metinleri v2 grep kapanışı için düzeltildi.
- `CoachAssignmentsPanel` için referans HTML yok; screenshot zorunlu değil (grep + e2e).
