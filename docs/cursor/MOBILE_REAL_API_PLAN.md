# Plan — Veli/Koç Mobil Ekranlarını Gerçek API'ye Bağlama

**Durum:** Veli + Koç mobil ekranları şu an `src/lib/parent-data.ts` ve
`src/lib/coach-data.ts` mock verisiyle çalışıyor (tasarım kaynağı da mock-driven).
Öğrenci ekranları zaten gerçek API kullanıyor (`/api/student/*` + mobil Bearer token).
Bu doküman, veli/koç ekranlarını canlı veriye bağlamak için uygulama planıdır.

## 1. Mevcut mimari (referans)

- **Mobil auth:** `/api/mobile/auth/login` → Bearer token (JWT). `apiFetch(path, { token })`.
  Artık `student|parent|coach` rollerini kabul ediyor (bu turda açıldı).
- **Öğrenci uçları:** `app/api/student/*` — `requireAuth(req, ["student"])` ile korunuyor,
  mobil token'dan `studentId` çözülüyor.
- **Web parent/coach uçları:** `app/api/parent/*`, `app/api/coach/*` — ama bunlar
  **next-auth session** (cookie) kullanıyor, mobil Bearer token değil. Doğrudan kullanılamaz.

## 2. Yapılacaklar (katman katman)

### A. Auth & token çözümleme
- `requireAuth` mobil token yolunun `parentId` / `coachId` çözdüğünü doğrula
  (token payload'ında zaten var: `mobile-token.ts`). Gerekirse helper:
  `resolveParentId(req)`, `resolveCoachId(req)`.
- `/api/mobile/auth/me`'yi rol-özel payload döndürecek şekilde genişlet
  (`mobile-me.service.ts`): parent → çocuk listesi özeti; coach → kadro sayacı.

### B. Mobil-auth'lu uçlar (yeni)
Öğrenci uçları desenini izle (`requireAuth(["parent"|"coach"])` + id çözümleme):

**Veli (`app/api/mobile/parent/*` veya `app/api/parent/*`'a mobil-auth ekle):**
| Uç | Döndürür | Kaynak servis |
|----|----------|----------------|
| `GET /children` | Veliye bağlı öğrenciler (özet) | `parent.service` |
| `GET /children/:id/assignments` | Çocuğun ödevleri | `student-assignments` (öğrenci scope'uyla) |
| `GET /children/:id/exams` | Çocuğun denemeleri | `student-exams` |
| `GET /children/:id/reports` | Haftalık raporlar | `reports.service` |
| `GET /billing` | Abonelik + faturalar | `billing.service` |
| `GET/POST /messages/:childId` | Veli↔koç mesaj | `messages.service` |
| `POST /appointments` | Randevu talebi | `appointments.service` |

**Koç (`app/api/mobile/coach/*`):**
| Uç | Döndürür | Kaynak servis |
|----|----------|----------------|
| `GET /students` | Kadro (özet + durum) | `coach-roster.service` |
| `GET /students/:id` | Öğrenci detay | mevcut roster/assignment servisleri |
| `GET /reviews` | İnceleme kuyruğu | `assignments` (submitted) |
| `POST /assignments` | Ödev ata | `assignments.service.create` |
| `GET /appointments` | Randevular | `appointments.service` |
| `GET/POST /threads` | Mesaj kutusu | `messages.service` |
| `POST /announcements` | Toplu duyuru | `announcements.service` |
| `GET/POST /exams` | Deneme atama | `exam.service` |
| `GET/POST /tasks` | Koç görevleri | yeni `coach-tasks` (web'de var) |

> Çoğu servis web tarafında **zaten var** (parent/coach panelleri için). İş, bunları
> mobil Bearer-auth ile saran ince route katmanı + RN tip sözleşmeleri.

### C. Mobil veri katmanı (RN)
- `parent-data.ts` / `coach-data.ts` mock'larını **tipler için** koru; veriyi
  `apiFetch` ile çek. Her ekran `useEffect` + `useState` (öğrenci ekranları gibi),
  yükleniyor/boş/hata durumlarıyla.
- `parent-context` aktif çocuğu API'den gelen listeden seçsin.
- React Query (opsiyonel) cache + refetch için; yoksa mevcut basit fetch deseni.

### D. Yazma işlemleri (mutations)
- Stub sheet'leri (ödev ata, randevu talep, duyuru, deneme ata, destek) yerel-state
  yerine `POST` uçlarına bağla; optimistic update + hata geri-alma.

## 3. Sıra & tahmin

1. Auth/token + `/me` rol payload (S) — yarım gün
2. Veli uçları + ekran bağlama (M) — 1–2 gün
3. Koç uçları + ekran bağlama (L) — 2–3 gün
4. Yazma uçları (mutations) + optimistic UI (M) — 1–2 gün
5. Test (unit + e2e auth/scope) + cihaz pası (S/M) — 1 gün

**Toplam:** ~1 hafta. Risk: web servislerinin mobil-auth ile yeniden kullanımı
(çoğu hazır) ve scope sızıntısı (veli yalnız kendi çocuğu, koç yalnız kendi kadrosu)
— `mutation-scope` benzeri sıkı test şart.

## 4. Bu plan kapsamında DEĞİL
- Global dark-mode uygulaması (tema switch şu an yerel; ayrı iş).
- Push bildirimleri.
- Gerçek ödeme entegrasyonu (kart değiştir akışı).
