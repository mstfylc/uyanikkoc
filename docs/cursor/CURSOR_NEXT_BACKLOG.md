# Uyanık Koç — Sonraki Geliştirme Backlog'u

Bu dosya mevcut PROMPT 01-13 akışını bozmaz. Cursor yalnızca kullanıcı açıkça `BACKLOG PROMPT XX` dediğinde uygular.

Ön koşul: PROMPT 02 ve PROMPT 03 tamamlanmadan bu backlog başlamaz. PROMPT 04-09 tamamlanmadan ürün ekranı büyütülmez.

## Backlog rapor kuralı

Her backlog fazı sonunda aynı handoff sistemi kullanılır:

- `docs/cursor/LATEST_HANDOFF.md`
- `docs/cursor/CURSOR_RUN_LOG.md`
- `docs/cursor/RISK_REPORT.md`

Rapor en fazla 8 satır.

---

## BACKLOG PROMPT 14 — Domain service layer

**Amaç:** API route içinde iş mantığı büyümesini engelle.

**Başlama şartı:** PROMPT 09 tamamlandı.

**Oku:** assignment API route'ları, `apps/web/lib/data/assignments.ts`, `packages/database/src/repositories/assignments.ts`, `packages/shared/src/index.ts`.

**Yap:** `apps/web/server/services/assignment.service.ts` oluştur. Create/list/complete akışlarını service layer üzerinden geçir. API route'lar sadece auth + input + response yapsın.

**Yapma:** Yeni tablo, yeni UI, yeni dependency ekleme.

**Test:** `pnpm typecheck`, `pnpm --filter @uyanik/web test`, `pnpm --filter @uyanik/web test:e2e`.

**Commit:** `refactor: introduce assignment service layer`.

---

## BACKLOG PROMPT 15 — Zod input contracts

**Amaç:** API inputlarını tipli ve güvenli hale getirmek.

**Oku:** `packages/contracts`, assignment API route'ları, assignment service, shared types.

**Yap:** Assignment create/complete/list response için Zod schema ekle. API route'larda body parsing schema ile yapılsın. Hatalar 400 JSON dönsün.

**Yapma:** tRPC'ye geçme. Büyük API mimari değişikliği yapma.

**Test:** `pnpm typecheck`, `pnpm --filter @uyanik/web test`.

**Commit:** `feat: add assignment zod contracts`.

---

## BACKLOG PROMPT 16 — Student study program v1

**Amaç:** Sistemi sadece ödev listesinden çıkarıp günlük çalışma planına taşımak.

**Başlama şartı:** Assignment alpha stabil.

**Oku:** Prisma schema, seed, student dashboard, student assignments, shared utilities.

**Yap:** Minimal `StudyTask` modeli veya assignment tabanlı program görünümü öner. Destructive migration varsa dur. İlk sürümde öğrenci dashboard'da `Bugünkü Program` kartı gerçek/dummy seed veriye bağlansın.

**Yapma:** FullCalendar, AI program, Pomodoro ekleme.

**Test:** `pnpm db:generate`, `pnpm typecheck`, web unit test.

**Commit:** `feat: add student study program v1`.

---

## BACKLOG PROMPT 17 — Topic tracking v1

**Amaç:** Rakipten ayrışan konu bazlı takip temelini başlatmak.

**Oku:** Prisma schema, seed, shared constants, student dashboard, coach dashboard.

**Yap:** Minimal `Subject`, `Topic`, `TopicProgress` modeli için öneri yap. Migration riskliyse dur. Seed'e birkaç TYT/LGS konu ekle. Student dashboard'da konu tamamlama özet kartı göster.

**Yapma:** Büyük konu ağacı, kaynak rozetleri, AI analiz ekleme.

**Test:** `pnpm db:generate`, `pnpm typecheck`.

**Commit:** `feat: add topic tracking foundation`.

---

## BACKLOG PROMPT 18 — Exam result v1

**Amaç:** Net ve deneme takibi için temel veri akışını kurmak.

**Oku:** Prisma schema, shared `calculateNet`, student dashboard, coach dashboard.

**Yap:** Minimal `ExamResult` modeli ekle. TYT/LGS demo sonuç seed'i oluştur. Dashboard'larda son net ve trend placeholder yerine DB verisi göster.

**Yapma:** 3 adımlı modal, AI analiz, zayıf konu otomasyonu ekleme.

**Test:** `pnpm db:generate`, `pnpm typecheck`, shared tests.

**Commit:** `feat: add exam result foundation`.

---

## BACKLOG PROMPT 19 — Coach student list v1

**Amaç:** Koç panelini gerçek operasyon ekranına yaklaştırmak.

**Oku:** coach dashboard, auth session, Prisma user/profile modelleri, assignment repository.

**Yap:** `/coach/students` minimal liste ekranı ekle. Öğrenci adı, sınav tipi placeholder, ödev durumu, risk bandı göster. Koç sadece kendi demo öğrencisini görsün.

**Yapma:** Bulk action, CSV, detay sekmeleri ekleme.

**Test:** `pnpm typecheck`, e2e role guard.

**Commit:** `feat: add coach student list v1`.

---

## BACKLOG PROMPT 20 — Student detail v1

**Amaç:** Koçun tek öğrenciyi takip edebileceği ilk detay sayfası.

**Oku:** coach student list, assignment service, student dashboard, parent summary.

**Yap:** `/coach/students/[id]` minimal detay: profil özeti, ödevler, tamamlanma oranı, kural tabanlı öneri. Permission kontrolü ekle.

**Yapma:** 7 sekme, chart, PDF, mesajlaşma ekleme.

**Test:** `pnpm typecheck`, e2e access guard.

**Commit:** `feat: add coach student detail v1`.

---

## BACKLOG PROMPT 21 — Parent report v1

**Amaç:** Veli panelini sadece metrik değil, yorumlanmış rapora taşımak.

**Oku:** parent dashboard, parent summary API, shared risk/comment helpers.

**Yap:** `/parent/reports` minimal rapor ekranı ekle. Haftalık ödev özeti, koç yorumu placeholder, risk/yönlendirme kartı göster.

**Yapma:** PDF, AI, akran karşılaştırma ekleme.

**Test:** `pnpm typecheck`, e2e parent route.

**Commit:** `feat: add parent report v1`.

---

## BACKLOG PROMPT 22 — Notification outbox v1

**Amaç:** Bildirim sistemine gerçek zamanlı servis eklemeden temel outbox modeli kurmak.

**Oku:** Prisma schema, assignment service, parent dashboard, coach dashboard.

**Yap:** Minimal `Notification` modeli ve repository öner. Assignment created/completed eventlerinde DB notification yaz. UI'da son bildirimler küçük kart olarak görünsün.

**Yapma:** Push, email, SMS, worker ekleme.

**Test:** `pnpm db:generate`, `pnpm typecheck`.

**Commit:** `feat: add notification outbox foundation`.

---

## BACKLOG PROMPT 23 — Messaging minimal model

**Amaç:** Koç-öğrenci-veli iletişimi için DB temelini kurmak.

**Oku:** Prisma schema, layouts, parent/coach sidebar.

**Yap:** Minimal `Conversation`, `ConversationParticipant`, `Message` modeli öner. Destructive risk varsa dur. Sadece read-only seed konuşma ekranı ekle.

**Yapma:** Pusher, WebSocket, dosya, ses, video ekleme.

**Test:** `pnpm db:generate`, `pnpm typecheck`.

**Commit:** `feat: add messaging foundation`.

---

## BACKLOG PROMPT 24 — Branch attendance foundation

**Amaç:** Uyanık Kütüphane farkı olan fiziksel kütüphane takibini başlatmak.

**Oku:** Prisma schema, branch dashboard, admin dashboard.

**Yap:** Minimal `AttendanceLog` modeli öner. Seed'e 3 demo giriş-çıkış ekle. Branch dashboard'da günlük giriş sayısı ve çalışma süresi kartı göster.

**Yapma:** QR, turnike, masa rezervasyon, cihaz entegrasyonu ekleme.

**Test:** `pnpm db:generate`, `pnpm typecheck`.

**Commit:** `feat: add branch attendance foundation`.

---

## BACKLOG PROMPT 25 — Audit and KVKK foundation

**Amaç:** Güvenlik, çocuk verisi ve KVKK temelini erken kurmak.

**Oku:** auth, API guard, Prisma schema, README/AGENTS.

**Yap:** Minimal `AuditLog` ve `ParentConsent` taslağı öner. Login/assignment action için audit helper ekle. `/legal/privacy` placeholder ekle.

**Yapma:** Hukuki metin üretme, VERBIS, gerçek silme akışı ekleme.

**Test:** `pnpm typecheck`, unit test.

**Commit:** `feat: add audit kvkk foundation`.

---

## BACKLOG PROMPT 26 — Design system cleanup

**Amaç:** UI büyümeden önce tekrar eden kart, badge, stat bileşenlerini ortaklaştırmak.

**Oku:** student dashboard, coach dashboard, parent dashboard, `packages/ui-web`.

**Yap:** `StatCard`, `StatusBadge`, `SectionCard`, `EmptyState` ortak bileşenlerini çıkar. Görünümü değiştirmeden tekrarları azalt.

**Yapma:** Yeni UI framework, Tailwind migration, Metronic asset ekleme.

**Test:** `pnpm typecheck`, e2e smoke.

**Commit:** `refactor: extract shared dashboard components`.

---

## BACKLOG PROMPT 27 — PWA/mobile readiness checkpoint

**Amaç:** Native uygulamaya geçmeden web'in mobil temelini düzeltmek.

**Oku:** layout, sidebar, header, dashboards, manifest varsa.

**Yap:** Mobil kırılım raporu çıkar; yalnızca küçük güvenli düzeltmeler yap. Touch target, responsive grid, sidebar drawer durumunu kontrol et.

**Yapma:** Expo, service worker, push ekleme.

**Test:** `pnpm typecheck`, Playwright viewport smoke test mümkünse.

**Commit:** `fix: improve mobile responsive shell`.

---

## BACKLOG PROMPT 28 — Alpha product review report

**Amaç:** Kod değiştirmeden ürünün artık ne kadar ilerlediğini raporlamak.

**Oku:** handoff dosyaları, run log, Prisma schema, README, dashboards, API route'ları.

**Yap:** `docs/reports/PRODUCT_ALPHA_REVIEW.md` oluştur. Kısa puanlama: Auth, DB, student, coach, parent, branch, AI, test, deploy.

**Commit:** `docs: add product alpha review`.

---

## Önerilen yeni sıra

Mevcut sıra bitince:

```text
14 → 15 → 16 → 17 → 18 → 19 → 20 → 21 → 22
```

Sonra operasyonel fark:

```text
23 → 24 → 25 → 26 → 27 → 28
```
