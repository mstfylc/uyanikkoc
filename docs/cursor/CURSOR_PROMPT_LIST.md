# Uyanık Koç — Cursor Aşamalı Prompt Listesi

Cursor bu dosyayı okuyabilir. **Görev bütünlüğüne göre bir oturumda birden çok PROMPT zincirlenip uygulanabilir**; her PROMPT kendi mantıksal commit'i ve kısa raporu ile kapanır. Amaç: token tüketimini azaltmak, raporları yönetilebilir tutmak ve projeyi şişirmeden ilerletmek. Sınır artık katı dosya/prompt sayısı değil; sınır **güvenliktir** (bkz. "Riskte dur").

## Aktif sertleştirme seti

Canlı kullanıcı testi öncesi DB/operasyon iyileştirme prompt'ları ayrı dosyada:
**`docs/cursor/CURSOR_DB_HARDENING_PROMPTS.md`** (sıra: P-DB-1 → P-DB-2 →
P-DB-3 → P-OPS-1 → P-TEST-1). Bağımsız commit'lenir; aynı oturumda zincirlenebilir.

## Kısa rapor zorunluluğu

Cursor her faz sonunda **en fazla 8 satır** rapor verir. Uzun tablo, uzun açıklama, dosya içerik özeti ve tekrar yok.

Zorunlu format:

```text
Durum: Başarılı / Risk / Başarısız
Değişen dosyalar: N dosya — kısa liste
Test: geçti / geçmedi / çalıştırılmadı
Commit: atıldı / atılmadı — sha veya sebep
Risk: yok / kısa risk
Sonraki adım: PROMPT XX
```

Risk varsa sadece şu format kullanılır:

```text
RISK REPORT
Sebep: ...
Etkilenen alan: ...
Öneri: ...
Devam için onay gerekli.
```

## Zorunlu handoff dosyaları

Cursor her faz sonunda şu 3 dosyayı günceller:

1. `docs/cursor/LATEST_HANDOFF.md` — son fazın tek bakış özeti.
2. `docs/cursor/CURSOR_RUN_LOG.md` — her faz için tek satır geçmiş.
3. `docs/cursor/RISK_REPORT.md` — yalnızca risk varsa güncellenir; risk yoksa `Status: clear` kalır.

Bu üç dosya sayesinde dış incelemede tüm repo tekrar taranmaz. Önce `LATEST_HANDOFF.md`, sonra gerekiyorsa commit diff ve değişen dosyalar okunur.

## Sabit kurallar

- Her fazda sadece `Oku` listesindeki dosyaları incele; tüm repoyu tarama.
- Dosya/prompt sayısı katı sınır değildir; değişikliği mantıksal commit'lere böl ve görevin gerektirdiği kadar PROMPT uygula. Yalnızca gerçekten riskli/destructive değişikliklerde `RISK REPORT` ver ve dur.
- Yeni ekran şişmesi yapma; önce mevcut koç → öğrenci → veli akışını güçlendir.
- AI Koç canlı entegrasyonu yapma; yalnızca `Yakında` yüzeyi kalacak.
- Production ortamda demo-memory store çalışamaz.
- CRM dosyalarına, CRM DB/env/upload/log alanlarına dokunma.
- Lisanslı Metronic assetlerini repoya ekleme.
- Generated/cache dosyalarını commit etme: `.next`, `.turbo`, `node_modules`, `*.tsbuildinfo`, loglar.
- Test/typecheck geçmeden commit atma.

## Riskte dur

Aşağıdaki durumda kod yazmayı bırak: destructive Prisma migration (DROP/ALTER COLUMN/RENAME, veri kaybı), auth/RBAC belirsizliği, korumasız API route, yeni external servis/major dependency, production-demo ayar karışması, test sebebi belirsiz fail, Vercel/self-host kararını etkileyen deploy değişikliği, secret/lisanslı asset riski. (Not: yüksek dosya sayısı tek başına durma sebebi değildir — riskli/belirsiz olması gerekir.)

---

## PROMPT 00 — Başlangıç denetimi

**Amaç:** Kod değiştirmeden gerçek durumu kısa raporla.

**Oku:** `package.json`, `pnpm-workspace.yaml`, `apps/web/package.json`, `apps/web/auth.ts`, `apps/web/middleware.ts`, `apps/web/lib/rbac.ts`, `apps/web/lib/data/env.ts`, `packages/database/prisma/schema.prisma`, `packages/database/prisma/seed.ts`, `.gitignore`.

**Yap:** Auth/session, RBAC, API guard, demo-memory production riski, test dosyaları, generated dosya durumunu kontrol et.

**Handoff:** `LATEST_HANDOFF.md` ve `CURSOR_RUN_LOG.md` güncelle. Risk yoksa `RISK_REPORT.md` clear kalsın.

**Çıktı:** En fazla 8 satır. Commit yok. Dur.

---

## PROMPT 01 — Repo hijyeni ve çalışma talimatları

**Amaç:** Davranışı değiştirmeden repo guardrail ekle.

**Oku:** `.gitignore`, `package.json`, `apps/web/package.json`, varsa `README.md`, varsa `AGENTS.md`.

**Yap:** README ve AGENTS yoksa ekle. `.gitignore` içine `*.tsbuildinfo` ekle. Commitlenmiş `*.tsbuildinfo` varsa kaldır.

**Test:** `pnpm typecheck`.

**Commit:** `chore: add repo guardrails`.

**Handoff:** Commit sonrası 3 handoff dosyasını güncelle ve aynı commit'e dahil et.

---

## PROMPT 02 — Production memory guard ve API guard standardı

**Amaç:** Demo-memory production'a sızmasın; API guard standardı netleşsin.

**Oku:** `apps/web/lib/data/env.ts`, `packages/database/src/client.ts`, `.env.example`, `apps/web/.env.production.example`, `apps/web/lib/auth/api-guard.ts`, `apps/web/app/api/coach/assignments/route.ts`, `apps/web/app/api/student/assignments/route.ts`, `apps/web/app/api/parent/summary/route.ts`.

**Yap:** Production'da demo-memory açıksa açık hata ver. `requireAuth` kullanımını netleştir; gerekirse küçük `withApiAuth` wrapper ekle. Mevcut 3 API route korumalı kalmalı.

**Test:** `pnpm typecheck`, `pnpm lint`.

**Commit:** `fix: guard production demo memory mode`.

**Handoff:** Commit sonrası 3 handoff dosyasını güncelle.

---

## PROMPT 03 — İlk gerçek testler

**Amaç:** Test configlerini gerçek testlerle destekle.

**Oku:** `apps/web/vitest.config.ts`, `apps/web/playwright.config.ts`, `apps/web/package.json`, `apps/web/lib/rbac.ts`, `packages/shared/src/index.ts`, `apps/web/components/auth/LoginForm.tsx`, `apps/web/app/post-login/page.tsx`.

**Yap:** Unit test ekle: `canAccessPath`, `getUnauthorizedRedirect`, `calculateNet`, `calculateStreak`, `calculateRiskScore`. E2E iskeleti ekle: login açılır, coach login olur, yanlış role route engellenir.

**Test:** `pnpm --filter @uyanik/web test`, `pnpm --filter @uyanik/web test:e2e`, `pnpm typecheck`.

**Commit:** `test: add auth rbac and shared utility tests`.

**Handoff:** Commit sonrası 3 handoff dosyasını güncelle.

---

## PROMPT 04 — Assignment alpha veri modeli

**Amaç:** Ödev akışını minimum production modeline yaklaştır.

**Oku:** `packages/database/prisma/schema.prisma`, `packages/database/prisma/seed.ts`, `packages/database/src/types.ts`, `packages/database/src/repositories/assignments.ts`, `apps/web/lib/data/assignments.ts`, `apps/web/mocks/assignments.ts`, `apps/web/app/api/coach/assignments/route.ts`, `apps/web/app/api/student/assignments/route.ts`.

**Yap:** Assignment için `description`, `type`, `priority`, `status`, `subject`, `dueDate`, `updatedAt` destekle. Sadece `title` ile POST çalışmaya devam etsin.

**Test:** `pnpm db:generate`, `pnpm typecheck`, `pnpm --filter @uyanik/web test`.

**Commit:** `feat: expand assignment alpha model`.

**Dur:** Destructive migration varsa `RISK REPORT`.

**Handoff:** Commit veya risk sonrası 3 handoff dosyasını güncelle.

---

## PROMPT 05 — Koç ödev formunu alpha seviyeye çıkar

**Amaç:** Basit başlık formunu gerçek alpha forma dönüştür.

**Oku:** `apps/web/app/coach/assignments/create/page.tsx`, `apps/web/components/demo-flow/CreateAssignmentPanel.tsx`, `apps/web/app/api/coach/assignments/route.ts`.

**Yap:** Forma `title`, `description`, `type`, `priority`, `subject`, `dueDate` ekle. Yeni dependency ekleme.

**Test:** `pnpm typecheck`, `pnpm --filter @uyanik/web test:e2e`.

**Commit:** `feat: upgrade coach assignment form`.

**Handoff:** Commit sonrası 3 handoff dosyasını güncelle.

---

## PROMPT 06 — Öğrenci ve veli ekranlarını yeni ödev verisine bağla

**Amaç:** Assignment alpha alanlarını öğrenci ve veli tarafında görünür yap.

**Oku:** `apps/web/components/demo-flow/StudentAssignmentList.tsx`, `apps/web/components/student/StudentDashboard.tsx`, `apps/web/components/parent/ParentDashboard.tsx`, `apps/web/app/api/student/assignments/route.ts`, `apps/web/app/api/parent/summary/route.ts`.

**Yap:** Öğrenci listesinde durum, öncelik, son tarih, ders/tür göster. Veli dashboard'a kural tabanlı haftalık yorum kartı ekle. OpenAI çağrısı yapma.

**Test:** `pnpm typecheck`, `pnpm --filter @uyanik/web test`, `pnpm --filter @uyanik/web test:e2e`.

**Commit:** `feat: show assignment details in student and parent views`.

**Handoff:** Commit sonrası 3 handoff dosyasını güncelle.

---

## PROMPT 07 — AI Koç Yakında yüzeyi

**Amaç:** AI canlı değilken farklılaştırmayı görünür tut.

**Oku:** `apps/web/components/layout/Sidebar.tsx`, `apps/web/components/student/StudentDashboard.tsx`, `.env.example`, `apps/web/.env.production.example`.

**Yap:** `/student/ai-coach` sayfası, sidebar item, dashboard bandı ve `/api/ai-coach` placeholder ekle. OpenAI çağrısı yapma.

**Test:** `pnpm typecheck`, `pnpm --filter @uyanik/web test:e2e`.

**Commit:** `feat: add ai coach coming soon surface`.

**Handoff:** Commit sonrası 3 handoff dosyasını güncelle.

---

## PROMPT 08 — Rules-v1 risk ve öneri

**Amaç:** AI kullanmadan ilk akıllı değer katmanı.

**Oku:** `packages/shared/src/index.ts`, `apps/web/components/coach/CoachDashboard.tsx`, `apps/web/components/parent/ParentDashboard.tsx`, `apps/web/components/student/StudentDashboard.tsx`, `apps/web/lib/data/assignments.ts`.

**Yap:** Pure helperlar ekle: completion rate, overdue count, rules-based risk, coach suggestion, parent weekly comment. Dashboard kartlarına bağla.

**Test:** `pnpm --filter @uyanik/shared test`, `pnpm typecheck`, `pnpm --filter @uyanik/web test`.

**Commit:** `feat: add rules based risk suggestions`.

**Handoff:** Commit sonrası 3 handoff dosyasını güncelle.

---

## PROMPT 09 — DB-backed alpha doğrulaması

**Amaç:** Memory store dışında PostgreSQL ile akışı doğrula.

**Oku:** `packages/database/src/client.ts`, `packages/database/src/repositories/auth.ts`, `packages/database/src/repositories/assignments.ts`, `packages/database/prisma/schema.prisma`, `packages/database/prisma/seed.ts`, `apps/web/lib/auth/resolve-user.ts`, `apps/web/lib/data/env.ts`.

**Yap:** DB modda auth, ödev oluşturma, öğrenci tamamlama ve veli summary çalışsın.

**Test:** `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm typecheck`.

**Commit:** `fix: verify db backed alpha flow`.

**Handoff:** Commit veya risk sonrası 3 handoff dosyasını güncelle.

---

## PROMPT 10 — Branch/Admin minimal shell

**Amaç:** Branch/admin rolleri boş görünmesin; franchise karmaşıklığı açılmasın.

**Oku:** `apps/web/app/branch/dashboard/page.tsx`, `apps/web/app/admin/dashboard/page.tsx`, `apps/web/components/layout/Sidebar.tsx`, `apps/web/lib/rbac.ts`.

**Yap:** Branch/admin minimal AppLayout ve kısa menü ekle. CRUD veya CRM entegrasyonu ekleme.

**Test:** `pnpm typecheck`, `pnpm --filter @uyanik/web test:e2e`.

**Commit:** `feat: add minimal branch admin shells`.

**Handoff:** Commit sonrası 3 handoff dosyasını güncelle.

---

## PROMPT 11 — CI kalite kapısı

**Amaç:** Her push'ta minimum kalite kontrolü çalışsın.

**Oku:** `package.json`, `apps/web/package.json`, `pnpm-workspace.yaml`, `turbo.json`, varsa `.github/workflows/*`.

**Yap:** CI ekle: install, db generate, typecheck, lint, unit test. External secret gerektirme.

**Test:** `pnpm typecheck`, `pnpm lint`, `pnpm test:unit`.

**Commit:** `ci: add basic quality gate`.

**Handoff:** Commit sonrası 3 handoff dosyasını güncelle.

---

## PROMPT 12 — Deploy kararı dokümantasyonu

**Amaç:** Production self-host, Vercel preview/demo kararını netleştir.

**Oku:** `.env.example`, `apps/web/.env.production.example`, varsa `deploy/*`, varsa `README.md`, varsa `vercel.json`.

**Yap:** `docs/deploy/DEPLOYMENT_DECISION.md` ekle. Production kendi sunucu; Vercel preview/demo. Config değiştirme gerekirse raporla.

**Test:** `pnpm typecheck`.

**Commit:** `docs: document deployment decision`.

**Handoff:** Commit veya risk sonrası 3 handoff dosyasını güncelle.

---

## PROMPT 13 — Alpha durum raporu

**Amaç:** Kod değiştirmeden sprint sonu kısa durum raporu üret.

**Oku:** README, AGENTS, package dosyaları, Prisma schema, assignment API route'ları, test klasörleri, `LATEST_HANDOFF.md`, `CURSOR_RUN_LOG.md`, `RISK_REPORT.md`.

**Yap:** `docs/reports/ALPHA_STATUS_REPORT.md` oluştur. İçerik kısa: tamamlananlar, riskler, test, DB alpha, mobil/worker, AI Koç, sonraki 5 öncelik.

**Commit:** `docs: add alpha status report`.

**Handoff:** `LATEST_HANDOFF.md` sprint kapanışı olarak güncelle.

---

## Cursor'a verilecek başlangıç mesajı

```text
Bu dosyadaki fazları sırayla uygula. Şu anda yalnızca PROMPT 01'i çalıştır. Rapor en fazla 8 satır olsun. Her faz sonunda docs/cursor/LATEST_HANDOFF.md ve docs/cursor/CURSOR_RUN_LOG.md dosyalarını güncelle. Risk varsa docs/cursor/RISK_REPORT.md dosyasını güncelle ve dur. Test geçmeden commit atma.
```

Önerilen sıra: `01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09`, sonra `10 → 11 → 12 → 13`.
