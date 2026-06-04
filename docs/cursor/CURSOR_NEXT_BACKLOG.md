# Uyanık Koç — Faz 2 Backlog (Cursor)

Sprint 1 (`CURSOR_PROMPT_LIST.md` 00–09) tamamlandıktan sonra uygulanır. Her backlog fazı için `CURSOR_PROMPT_LIST.md` ile aynı sabit kurallar geçerlidir (8–10 dosya, test geçmeden commit yok, AI canlı yok, CRM izolasyonu).

---

## BACKLOG PROMPT 14 — Koç öğrenci roster (alpha)

**Amaç:** Tek koçun birden fazla demo öğrenciye bağlanması için minimal roster.

**Oku:** `packages/database/prisma/schema.prisma`, `apps/web/app/api/coach/assignments/route.ts`, `apps/web/components/coach/CoachDashboard.tsx`.

**Yap:** Coach–student ilişkisi için minimal model veya mevcut profile genişletmesi. Ödev atarken öğrenci seçimi (dropdown). Seed’de 2. demo öğrenci opsiyonel.

**Yapma:** Franchise, şube değiştirici, toplu import.

**Test:** `pnpm db:generate`, `pnpm typecheck`, `pnpm test:unit`.

**Commit:** `feat: add coach student roster alpha`.

**Dur:** Destructive migration gerekiyorsa dur.

---

## BACKLOG PROMPT 15 — Mesajlaşma iskeleti

**Amaç:** Koç ↔ veli / koç ↔ öğrenci için okunmamış sayacı olmayan basit mesaj thread UI.

**Başlama şartı:** 14 tamamlandı.

**Yap:** `MessageThread` + `Message` minimal model. Liste + tek thread görünümü. Bellek veya DB adapter.

**Yapma:** WebSocket, push, dosya eki, CRM mesaj senkronu.

**Test:** `pnpm typecheck`, `pnpm test:unit`.

**Commit:** `feat: add messaging skeleton`.

---

## BACKLOG PROMPT 16 — Bildirim / hatırlatma iskeleti

**Amaç:** Ödev son tarihi ve deneme hatırlatması için in-app bildirim listesi (push yok).

**Başlama şartı:** 14 tamamlandı.

**Yap:** `Notification` minimal model, öğrenci/veli için okunmamış badge. Rules-v1: gecikmiş ödev → bildirim kaydı.

**Yapma:** FCM, e-posta, SMS, cron worker.

**Test:** `pnpm typecheck`, `pnpm test:unit`.

**Commit:** `feat: add in app notification skeleton`.

---

## BACKLOG PROMPT 17 — Konu takibi (kullanıcı tanımlı)

**Amaç:** Öğrencinin/koçun kendi konu listesini yönetebildiği minimal konu takibi.

**Oku:** `packages/database/prisma/schema.prisma`, `packages/shared/src/index.ts`, `apps/web/components/student/StudentDashboard.tsx`.

**Yap:** Minimal Subject, Topic, TopicProgress modeli ekle.
- examType enum: TYT | AYT | LGS | GENEL (öncelik YKS)
- Konular KULLANICI TANIMLI: öğrenci/koç kendi takip edeceği konuyu ekleyebilir/düzenleyebilir/silebilir.
- Seed sadece başlangıç örneği, silinebilir/değiştirilebilir.
- Sabit dev konu ağacı YOK.
- Student dashboard'da konu tamamlama özet kartı.

**Yapma:** Tüm YKS müfredatını hardcode etme. Kaynak rozetleri ve AI analiz bu fazda yok. Migration riskliyse dur.

**Test:** `pnpm db:generate`, `pnpm typecheck`, `pnpm test:unit`.

**Commit:** `feat: add user defined topic tracking`.

---

## BACKLOG PROMPT 18 — Deneme sonuçları (YKS öncelik)

**Amaç:** TYT/AYT odaklı deneme net kaydı ve trend özeti.

**Oku:** `packages/shared/src/index.ts`, `packages/database/prisma/schema.prisma`, `apps/web/components/student/StudentDashboard.tsx`, `apps/web/components/coach/CoachDashboard.tsx`.

**Yap:** Minimal ExamResult + ExamSubjectResult modeli ekle.
- examType: TYT | AYT | LGS (öncelik YKS — TYT/AYT)
- net = doğru - yanlış/4 (packages/shared calculateNet)
- Seed: YKS odaklı demo sonuç. LGS sonra.
- Dashboard'da son net + trend DB verisinden.

**Yapma:** 3 adımlı modal, AI analiz, zayıf konu otomasyonu.

**Test:** `pnpm db:generate`, `pnpm typecheck`, `pnpm test:unit`.

**Commit:** `feat: add exam results yks alpha`.

---

## BACKLOG PROMPT 19 — Veli rapor özeti genişletme

**Amaç:** Veli dashboard’da konu + deneme özetini birleştir.

**Başlama şartı:** 17, 18 tamamlandı.

**Yap:** Parent summary API’ye konu tamamlama % ve son deneme net ekle. Rules-v1 haftalık yorum güncelle.

**Yapma:** PDF export, e-posta gönderimi.

**Test:** `pnpm typecheck`, `pnpm test:unit`, `pnpm --filter @uyanik/web test:e2e`.

**Commit:** `feat: expand parent report summary`.

---

## BACKLOG PROMPT 20 — Koç deneme girişi

**Amaç:** Koçun öğrenci adına deneme sonucu girebilmesi.

**Başlama şartı:** 18 tamamlandı.

**Yap:** `/coach/exams` minimal form (TYT/AYT, ders satırları). API POST korumalı.

**Yapma:** Toplu CSV import, AI yorum.

**Test:** `pnpm typecheck`, `pnpm test:unit`.

**Commit:** `feat: add coach exam entry`.

---

## BACKLOG PROMPT 21 — Öğrenci detay (koç görünümü)

**Amaç:** Koçun tek öğrencinin ödev + konu + deneme özetini görmesi.

**Başlama şartı:** 17, 18, 14 tamamlandı.

**Yap:** `/coach/students/[id]` shell: özet kartlar, son ödevler, konu %, son net.

**Yapma:** Tam CRM profil, notlar, dosya yükleme.

**Test:** `pnpm typecheck`, `pnpm test:unit`.

**Commit:** `feat: add coach student detail shell`.

---

## BACKLOG PROMPT 22 — Ödev şablonları

**Amaç:** Koçun sık kullandığı ödev başlıklarını şablon olarak kaydetmesi.

**Başlama şartı:** 05, 14 tamamlandı.

**Yap:** `AssignmentTemplate` minimal model, create formda şablon seçimi.

**Yapma:** Bulk atama, şablon paylaşımı org geneli.

**Test:** `pnpm db:generate`, `pnpm typecheck`, `pnpm test:unit`.

**Commit:** `feat: add assignment templates`.

---

## BACKLOG PROMPT 23 — Franchise şube UI (ERTELENDİ)

**Amaç:** Çoklu şube yönetimi.

**Durum:** Ertelendi — `SINGLE_BRANCH_MODE=true` korunur.

---

## BACKLOG PROMPT 24 — Ödeme / abonelik (ERTELENDİ)

**Amaç:** Stripe/iyzico entegrasyonu.

**Durum:** Ertelendi.

---

## BACKLOG PROMPT 25 — Native mobil hazırlık (ERTELENDİ)

**Amaç:** `apps/mobile` API sözleşmeleri.

**Durum:** Ertelendi.

---

## BACKLOG PROMPT 26 — Worker kuyruk iskeleti

**Amaç:** `apps/worker` için boş job runner ve health endpoint.

**Yap:** README + `pnpm --filter @uyanik/worker` typecheck. Job stub: `assignment-reminder` (log only).

**Yapma:** Redis, BullMQ, production deploy.

**Test:** `pnpm typecheck`.

**Commit:** `chore: add worker job skeleton`.

---

## BACKLOG PROMPT 27 — Public API health genişletme

**Amaç:** `/api/health` DB bağlantı durumu dönsün (ops için).

**Yap:** Health route’a `database: ok|memory|down` alanı. Production’da memory modu `down` sayılır.

**Yapma:** Prometheus, Sentry.

**Test:** `pnpm typecheck`, `pnpm test:unit`.

**Commit:** `feat: expand health check status`.

---

## BACKLOG PROMPT 28 — AI Koç canlı (ERTELENDİ)

**Amaç:** OpenAI entegrasyonu.

**Durum:** Ertelendi — `AI_COACH_ENABLED=false` zorunlu.

---

## BACKLOG PROMPT 29 — Motivasyon / Streak (kapatılabilir)

**Amaç:** Streak + rozet. Kaygı yaratmaması için açılıp kapatılabilir, hem koç hem öğrenci kontrol eder.

**Başlama şartı:** 17, 18, 16 tamamlandı.

**Yap:**
- StudentProfile'a motivationEnabled Boolean @default(true)
- Öğrenci kendi ayarından, koç öğrenci detayından açar/kapatır
- Kapalıyken: sidebar menüsü gizli, sayfa "kapalı" durumu, dashboard streak kartı görünmez
- GET /api/student/motivation (enabled=false ise {enabled:false})
- PATCH /api/student/motivation/settings (öğrenci)
- PATCH /api/coach/students/[id]/motivation (koç)
- Rozetler rules-v1: "7 gün seri", "ilk deneme", "10 konu"
- UI: app/student/motivation/page.tsx + MotivationPanel.tsx

**Yapma:** AI mesaj, lig/sıralama, push, real-time.

**Test:** `pnpm db:generate`, `pnpm typecheck`, `pnpm test:unit`.

**Commit:** `feat: add toggleable motivation streak`.

---

## Sprint 1 tamamlanmayan (ERTELENDİ)

| Prompt | Konu | Not |
|--------|------|-----|
| 10 | Branch/Admin shell | İsteğe bağlı; 09 sonrası |
| 12 | Deploy dokümantasyonu | Vercel kararı netleşince |
| 13 | Alpha durum raporu | Sprint kapanışı |

---

## Önerilen yeni sıra (Yol-C)

```text
09 → 14 → 17 → 18 → 16 → 15 → 19 → 20 → 21 → 29 → 22 → 26 → 27
```

**Ertelenen:** 23, 24, 25, 10, 12, 13, 28

**Not:** 11 (CI) tamamlandıysa sıraya dahil değil. Her faz sonunda `LATEST_HANDOFF.md` ve `CURSOR_RUN_LOG.md` güncelle.

---

## Cursor başlangıç mesajı (faz 2)

```text
CURSOR_NEXT_BACKLOG.md dosyasındaki sıradaki TEK backlog prompt'u uygula.
Önce PROMPT 14. Risk varsa dur. Test geçmeden commit atma.
```
