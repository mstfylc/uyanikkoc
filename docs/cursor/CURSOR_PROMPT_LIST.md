# Uyanık Koç — Cursor Aşamalı Prompt Listesi

Bu dosya Cursor'a tek seferde verilebilir; ancak Cursor **yalnızca istenen fazı uygular**, rapor verir ve durur. Amaç: token kullanımını düşük tutarak önce Auth + RBAC + DB-backed koç → öğrenci → veli akışını testli hale getirmek.

## Sabit kurallar

- Her fazda sadece `Oku` listesindeki dosyaları incele; tüm repoyu tarama.
- Faz başına en fazla 8-10 dosya değiştir; aşılacaksa `RISK REPORT` ver ve dur.
- Yeni ekran şişmesi yapma; önce mevcut dikey akışı güçlendir.
- AI Koç canlı entegrasyonu yapma; yalnızca `Yakında` yüzeyi kalacak.
- Production ortamda demo-memory store çalışamaz.
- CRM dosyalarına, CRM DB/env/upload/log alanlarına dokunma.
- Lisanslı Metronic assetlerini repoya ekleme.
- Generated/cache dosyalarını commit etme: `.next`, `.turbo`, `node_modules`, `*.tsbuildinfo`, loglar.
- Test/typecheck geçmeden commit atma.

## Riskte dur

Aşağıdaki durumda kod yazmayı bırak: destructive Prisma migration, auth/RBAC belirsizliği, korumasız API route, yeni external servis/major dependency, production-demo ayar karışması, 10+ dosya değişikliği, test sebebi belirsiz fail, Vercel/self-host kararını etkileyen deploy değişikliği, secret/lisanslı asset riski.

## Her faz raporu

```text
Değişen dosyalar:
Test:
Risk:
Sonraki öneri:
```

---

## PROMPT 00 — Başlangıç denetimi

**Amaç:** Kod değiştirmeden gerçek durumu raporla.

**Oku:** `package.json`, `pnpm-workspace.yaml`, `apps/web/package.json`, `apps/web/auth.ts`, `apps/web/middleware.ts`, `apps/web/lib/rbac.ts`, `apps/web/lib/data/env.ts`, `packages/database/prisma/schema.prisma`, `packages/database/prisma/seed.ts`, `.gitignore`.

**Yap:** Auth/session alanları, RBAC pathleri, API guard yaklaşımı, demo-memory production riski, gerçek test dosyaları, generated dosya varlığı raporu.

**Çıktı:** Durum, kritik riskler, Faz 01'e geçilebilir mi?

**Dur:** Bu faz sonunda dur. Commit yok.

---

## PROMPT 01 — Repo hijyeni ve çalışma talimatları

**Amaç:** Davranışı değiştirmeden repo guardrail ekle.

**Oku:** `.gitignore`, `package.json`, `apps/web/package.json`, varsa `README.md`, varsa `AGENTS.md`.

**Yap:** README yoksa ekle; AGENTS yoksa ekle. AGENTS kararları: Uyanık Koç, CRM'den izole çalışma, AI Koç Yakında, production memory yasak, yeni ekran şişmesi yasak. `.gitignore` içine `*.tsbuildinfo` ekle; commitlenmiş `*.tsbuildinfo` varsa kaldır.

**Test:** `pnpm typecheck`.

**Commit:** `chore: add repo guardrails`.

**Dur:** Typecheck geçmezse commit atma.

---

## PROMPT 02 — Production memory guard ve API guard standardı

**Amaç:** Demo-memory production'a sızmasın; API guard standardı netleşsin.

**Oku:** `apps/web/lib/data/env.ts`, `packages/database/src/client.ts`, `.env.example`, `apps/web/.env.production.example`, `apps/web/lib/auth/api-guard.ts`, `apps/web/app/api/coach/assignments/route.ts`, `apps/web/app/api/student/assignments/route.ts`, `apps/web/app/api/parent/summary/route.ts`.

**Yap:** Production'da demo-memory açıksa açık hata ver. `requireAuth` kullanımını netleştir; gerekirse küçük `withApiAuth` wrapper ekle. Mevcut 3 API route korumalı kalmalı.

**Yapma:** Auth provider veya endpoint path değiştirme.

**Test:** `pnpm typecheck`, `pnpm lint`.

**Commit:** `fix: guard production demo memory mode`.

**Dur:** Auth/session davranışı değişirse raporla.

---

## PROMPT 03 — İlk gerçek testler

**Amaç:** Test configlerini gerçek testlerle destekle.

**Oku:** `apps/web/vitest.config.ts`, `apps/web/playwright.config.ts`, `apps/web/package.json`, `apps/web/lib/rbac.ts`, `packages/shared/src/index.ts`, `apps/web/components/auth/LoginForm.tsx`, `apps/web/app/post-login/page.tsx`.

**Yap:** Unit test ekle: `canAccessPath`, `getUnauthorizedRedirect`, `calculateNet`, `calculateStreak`, `calculateRiskScore`. E2E iskeleti ekle: login açılır, coach login olur, yanlış role route engellenir. Testler demo-memory ile çalışsın.

**Test:** `pnpm --filter @uyanik/web test`, `pnpm --filter @uyanik/web test:e2e`, `pnpm typecheck`.

**Commit:** `test: add auth rbac and shared utility tests`.

**Dur:** Playwright/NextAuth testte çalışmazsa raporla.

---

## PROMPT 04 — Assignment alpha veri modeli

**Amaç:** Ödev akışını minimum production modeline yaklaştır.

**Oku:** `packages/database/prisma/schema.prisma`, `packages/database/prisma/seed.ts`, `packages/database/src/types.ts`, `packages/database/src/repositories/assignments.ts`, `apps/web/lib/data/assignments.ts`, `apps/web/mocks/assignments.ts`, `apps/web/app/api/coach/assignments/route.ts`, `apps/web/app/api/student/assignments/route.ts`.

**Yap:** Assignment için `description`, `type`, `priority`, `status`, `subject`, `dueDate`, `updatedAt` destekle. Prisma, repository, memory mock ve API tiplerini uyumlu yap. Sadece `title` ile POST hâlâ çalışsın. `completeAssignment` tamamlandı durumunu tutarlı güncellesin.

**Test:** `pnpm db:generate`, `pnpm typecheck`, `pnpm --filter @uyanik/web test`.

**Commit:** `feat: expand assignment alpha model`.

**Dur:** Destructive migration gerekiyorsa `RISK REPORT — Prisma migration` ver.

---

## PROMPT 05 — Koç ödev formunu alpha seviyeye çıkar

**Amaç:** Basit başlık formunu gerçek alpha forma dönüştür.

**Oku:** `apps/web/app/coach/assignments/create/page.tsx`, `apps/web/components/demo-flow/CreateAssignmentPanel.tsx`, `apps/web/app/api/coach/assignments/route.ts`.

**Yap:** Forma `title`, `description`, `type`, `priority`, `subject`, `dueDate` ekle. Basit client validation ekle. Başarılı kayıtta ödev özeti göster. Mobilde tek kolon düzen kullan.

**Yapma:** Quill, Dropzone, Select2, çoklu öğrenci, bulk akış ekleme.

**Test:** `pnpm typecheck`, `pnpm --filter @uyanik/web test:e2e`.

**Commit:** `feat: upgrade coach assignment form`.

**Dur:** Yeni dependency gerekiyorsa raporla.

---

## PROMPT 06 — Öğrenci ve veli ekranlarını yeni ödev verisine bağla

**Amaç:** Assignment alpha alanlarını öğrenci ve veli tarafında görünür yap.

**Oku:** `apps/web/components/demo-flow/StudentAssignmentList.tsx`, `apps/web/components/student/StudentDashboard.tsx`, `apps/web/components/parent/ParentDashboard.tsx`, `apps/web/app/api/student/assignments/route.ts`, `apps/web/app/api/parent/summary/route.ts`.

**Yap:** Öğrenci listesinde durum, öncelik, son tarih, ders/tür göster. Tamamla butonu sadece açık ödevlerde görünsün. Veli dashboard'a kural tabanlı haftalık yorum kartı ekle. OpenAI çağrısı yapma.

**Test:** `pnpm typecheck`, `pnpm --filter @uyanik/web test`, `pnpm --filter @uyanik/web test:e2e`.

**Commit:** `feat: show assignment details in student and parent views`.

**Dur:** Demo akışı kırılırsa raporla.

---

## PROMPT 07 — AI Koç Yakında yüzeyi

**Amaç:** AI canlı değilken farklılaştırmayı görünür tut.

**Oku:** `apps/web/components/layout/Sidebar.tsx`, `apps/web/components/student/StudentDashboard.tsx`, `.env.example`, `apps/web/.env.production.example`.

**Yap:** `/student/ai-coach` sayfası ekle: `AI Koç Yakında`. Sidebar'a `AI Koç · Yakında` ekle. Student dashboard'a küçük yakında bandı ekle. `/api/ai-coach` placeholder route ekle; feature flag kapalıysa canlı cevap üretmesin.

**Yapma:** OpenAI SDK, streaming, upload, vision ekleme.

**Test:** `pnpm typecheck`, `pnpm --filter @uyanik/web test:e2e`.

**Commit:** `feat: add ai coach coming soon surface`.

**Dur:** External API çağrısı gerekecekse raporla.

---

## PROMPT 08 — Rules-v1 risk ve öneri

**Amaç:** AI kullanmadan ilk akıllı değer katmanı.

**Oku:** `packages/shared/src/index.ts`, `apps/web/components/coach/CoachDashboard.tsx`, `apps/web/components/parent/ParentDashboard.tsx`, `apps/web/components/student/StudentDashboard.tsx`, `apps/web/lib/data/assignments.ts`.

**Yap:** Pure helperlar ekle: completion rate, overdue count, rules-based risk, coach suggestion, parent weekly comment. Koç dashboard'a risk kartı, veli dashboard'a yorum kartı, öğrenci dashboard'a bugünkü öncelik kartı ekle.

**Yapma:** RiskScore DB tablosu, cron, worker, AI ekleme.

**Test:** `pnpm --filter @uyanik/shared test`, `pnpm typecheck`, `pnpm --filter @uyanik/web test`.

**Commit:** `feat: add rules based risk suggestions`.

**Dur:** Helperlar UI içine gömülecekse raporla.

---

## PROMPT 09 — DB-backed alpha doğrulaması

**Amaç:** Memory store dışında PostgreSQL ile akışı doğrula.

**Oku:** `packages/database/src/client.ts`, `packages/database/src/repositories/auth.ts`, `packages/database/src/repositories/assignments.ts`, `packages/database/prisma/schema.prisma`, `packages/database/prisma/seed.ts`, `apps/web/lib/auth/resolve-user.ts`, `apps/web/lib/data/env.ts`.

**Yap:** `DEMO_AUTH_ALLOW_IN_MEMORY=false` ve `DATABASE_URL` varken auth DB'den çalışsın. Seed sonrası demo kullanıcılar login olabilsin. Koç ödevi DB'ye yazsın, öğrenci tamamlayınca DB update olsun, veli summary DB'den gelsin.

**Test:** `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm typecheck`.

**Commit:** `fix: verify db backed alpha flow`.

**Dur:** Migration veya seed idempotent değilse raporla.

---

## PROMPT 10 — Branch/Admin minimal shell

**Amaç:** RBAC'ta var olan branch/admin rolleri boş görünmesin; franchise karmaşıklığı açılmasın.

**Oku:** `apps/web/app/branch/dashboard/page.tsx`, `apps/web/app/admin/dashboard/page.tsx`, `apps/web/components/layout/Sidebar.tsx`, `apps/web/lib/rbac.ts`.

**Yap:** Branch/admin için minimal AppLayout kullan. Branch menüsü: Dashboard, Öğrenciler, Koçlar, Raporlar. Admin menüsü: Dashboard, Kullanıcılar, Sistem Sağlığı. Sayfalara `single-branch alpha` açıklaması ekle.

**Yapma:** CRUD, organization switcher, CRM entegrasyonu ekleme.

**Test:** `pnpm typecheck`, `pnpm --filter @uyanik/web test:e2e`.

**Commit:** `feat: add minimal branch admin shells`.

**Dur:** 10 dosya sınırı aşılırsa raporla.

---

## PROMPT 11 — CI kalite kapısı

**Amaç:** Her push'ta minimum kalite kontrolü çalışsın.

**Oku:** `package.json`, `apps/web/package.json`, `pnpm-workspace.yaml`, `turbo.json`, varsa `.github/workflows/*`.

**Yap:** `.github/workflows/ci.yml` ekle. CI: install, db generate, typecheck, lint, unit test. E2E başlangıçta manual veya ayrı job olabilir. External secret gerektirme.

**Test:** `pnpm typecheck`, `pnpm lint`, `pnpm test:unit`.

**Commit:** `ci: add basic quality gate`.

**Dur:** CI external secret isterse raporla.

---

## PROMPT 12 — Deploy kararı dokümantasyonu

**Amaç:** Production self-host, Vercel preview/demo kararını netleştir.

**Oku:** `.env.example`, `apps/web/.env.production.example`, varsa `deploy/*`, varsa `README.md`, varsa `vercel.json`.

**Yap:** `docs/deploy/DEPLOYMENT_DECISION.md` ekle. Production: kendi sunucu + ayrı app/db/upload/log. Vercel: preview/demo/landing. CRM izolasyon kararını yaz. Vercel config değiştirme; gerekirse raporla.

**Test:** `pnpm typecheck`.

**Commit:** `docs: document deployment decision`.

**Dur:** Deploy config değişikliği gerekiyorsa raporla.

---

## PROMPT 13 — Alpha durum raporu

**Amaç:** Kod değiştirmeden sprint sonu durum raporu üret.

**Oku:** README, AGENTS, package dosyaları, Prisma schema, assignment API route'ları, test klasörleri.

**Yap:** `docs/reports/ALPHA_STATUS_REPORT.md` oluştur. İçerik: tamamlananlar, riskler, test durumu, DB-backed alpha, mobil/worker, AI Koç, sonraki 5 öncelik. Kod değiştirme.

**Commit:** `docs: add alpha status report`.

**Dur:** Sprint kapanışıdır. Yeni feature başlatma.

---

## Cursor'a verilecek başlangıç mesajı

```text
Bu dosyadaki fazları sırayla uygula. Şu anda yalnızca PROMPT 00'ı çalıştır. Faz sonunda dur, rapor ver ve sonraki faz için onay bekle. Risk raporu gerektiren durumda kod yazmayı bırak. Test geçmeden commit atma.
```

Önerilen ilk sprint sırası:

```text
00 → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09
```

İkinci sprint:

```text
10 → 11 → 12 → 13
```
