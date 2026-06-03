# Uyanık Koç — Cursor Aşamalı Prompt Listesi

Bu dosya Cursor'a tek seferde verilebilir. Cursor **yalnızca istenen fazı uygular**, faz sonunda rapor verir ve durur. Bir sonraki faz için kullanıcıdan açık komut bekler.

Ana hedef: projeyi şişirmeden, önce Auth + RBAC + DB-backed koç → öğrenci → veli akışını testli hale getirmek.

---

## Genel çalışma kuralları

1. Her fazda yalnızca `Okunacak dosyalar` bölümündeki dosyaları oku.
2. Tüm repoyu tarama; ek dosya gerekirse önce raporla.
3. Bir fazda en fazla 8-10 dosya değiştir. Daha fazlası gerekiyorsa dur.
4. Yeni ekran açma; mevcut dikey akışı güçlendir.
5. AI Koç canlı entegrasyonu yapma. AI Koç sadece `Yakında` olarak görünür kalacak.
6. Production ortamda demo-memory çalışma moduna izin verme.
7. CRM ile ilgili dosya, ortam değişkeni, veri tabanı veya upload alanına dokunma.
8. Lisanslı Metronic assetlerini repoya ekleme.
9. Build/cache çıktısı commit etme: `.next`, `.turbo`, `node_modules`, `*.tsbuildinfo`, log dosyaları.
10. Test geçmeden commit atma.

## Riskte durma kuralları

Aşağıdaki durumda kod yazmayı bırak ve `RISK REPORT` üret:

- Prisma migration veri kaybı yaratabilir.
- Auth veya RBAC davranışı belirsizleşir.
- API route korumasız kalır.
- 10'dan fazla dosya değişmesi gerekir.
- Yeni servis veya yeni major dependency gerekir.
- Production/demo ayarları karışır.
- Testler çalışmaz ve sebep net değildir.
- Deploy ayarı Vercel/self-host kararını etkiler.

## Her faz sonunda rapor formatı

```text
Değişen dosyalar:
Test:
Risk:
Sonraki öneri:
```

---

# PROMPT 00 — Başlangıç denetimi

**Amaç:** Kod değiştirmeden repo durumunu raporla.

**Okunacak dosyalar:**

- `package.json`
- `pnpm-workspace.yaml`
- `apps/web/package.json`
- `apps/web/auth.ts`
- `apps/web/middleware.ts`
- `apps/web/lib/rbac.ts`
- `apps/web/lib/data/env.ts`
- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/seed.ts`
- `.gitignore`

**Yapılacaklar:**

1. Auth var mı, session içinde hangi alanlar var raporla.
2. RBAC hangi pathleri koruyor raporla.
3. API route güvenliği route içinde mi, middleware içinde mi raporla.
4. Demo-memory modu production'a sızabilir mi kontrol et.
5. Test dosyaları gerçekten var mı kontrol et.
6. Commitlenmiş generated dosya var mı kontrol et.

**Çıktı:** Durum, kritik riskler, Faz 01'e geçilebilir mi?

**Dur:** Bu faz sonunda dur.

---

# PROMPT 01 — Repo hijyeni ve çalışma talimatları

**Amaç:** Proje davranışını değiştirmeden Cursor/Codex güvenlik kurallarını repoya yerleştir.

**Okunacak dosyalar:** `.gitignore`, `package.json`, `apps/web/package.json`, varsa `README.md`, varsa `AGENTS.md`.

**Yapılacaklar:**

1. `README.md` yoksa kısa ve gerçek durumu anlatan README ekle.
2. `AGENTS.md` yoksa ekle. Kararlar: Uyanık Koç adı, CRM'den izole çalışma, AI Koç Yakında, production memory yasak, yeni ekran şişmesi yasak.
3. `.gitignore` içine `*.tsbuildinfo` ekle.
4. Repoda commitlenmiş `*.tsbuildinfo` varsa kaldır.

**Test:** `pnpm typecheck`

**Commit mesajı:** `chore: add repo guardrails`

**Dur:** Typecheck geçmezse commit atma.

---

# PROMPT 02 — Production memory guard ve API guard standardı

**Amaç:** Demo-memory modun production'a sızmasını engelle ve API korumasını standartlaştır.

**Okunacak dosyalar:**

- `apps/web/lib/data/env.ts`
- `packages/database/src/client.ts`
- `.env.example`
- `apps/web/.env.production.example`
- `apps/web/lib/auth/api-guard.ts`
- `apps/web/app/api/coach/assignments/route.ts`
- `apps/web/app/api/student/assignments/route.ts`
- `apps/web/app/api/parent/summary/route.ts`

**Yapılacaklar:**

1. Production'da demo-memory açık kalırsa açık hata ver.
2. `requireAuth` kullanımını netleştir.
3. Gerekirse küçük `withApiAuth` wrapper ekle.
4. Mevcut 3 API route'un korumalı kaldığını doğrula.

**Yapılmayacaklar:** Auth provider değiştirme, endpoint path değiştirme.

**Test:** `pnpm typecheck`, `pnpm lint`

**Commit mesajı:** `fix: guard production demo memory mode`

**Dur:** Auth/session davranışı değişirse raporla.

---

# PROMPT 03 — İlk gerçek testler

**Amaç:** Var olan test configlerini gerçek testlerle desteklemek.

**Okunacak dosyalar:**

- `apps/web/vitest.config.ts`
- `apps/web/playwright.config.ts`
- `apps/web/package.json`
- `apps/web/lib/rbac.ts`
- `packages/shared/src/index.ts`
- `apps/web/components/auth/LoginForm.tsx`
- `apps/web/app/post-login/page.tsx`

**Yapılacaklar:**

1. Unit test ekle: `canAccessPath`, `getUnauthorizedRedirect`, `calculateNet`, `calculateStreak`, `calculateRiskScore`.
2. E2E iskeleti ekle: login sayfası açılır, coach login olur, yanlış role route engellenir.
3. Testler demo-memory modda çalışsın.

**Test:** `pnpm --filter @uyanik/web test`, `pnpm --filter @uyanik/web test:e2e`, `pnpm typecheck`

**Commit mesajı:** `test: add auth rbac and shared utility tests`

**Dur:** Playwright veya NextAuth testte çalışmazsa raporla.

---

# PROMPT 04 — Assignment alpha veri modeli

**Amaç:** Ödev akışını production'a yaklaşan minimum modele taşımak.

**Okunacak dosyalar:**

- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/seed.ts`
- `packages/database/src/types.ts`
- `packages/database/src/repositories/assignments.ts`
- `apps/web/lib/data/assignments.ts`
- `apps/web/mocks/assignments.ts`
- `apps/web/app/api/coach/assignments/route.ts`
- `apps/web/app/api/student/assignments/route.ts`

**Yapılacaklar:**

Assignment için şu alanları ekle veya destekle:

```text
description, type, priority, status, subject, dueDate, updatedAt
```

1. Prisma schema, repository, memory mock ve API tiplerini uyumlu yap.
2. Sadece `title` ile POST hâlâ çalışsın.
3. `completeAssignment` tamamlandı durumunu tutarlı güncellesin.

**Test:** `pnpm db:generate`, `pnpm typecheck`, `pnpm --filter @uyanik/web test`

**Commit mesajı:** `feat: expand assignment alpha model`

**Dur:** Destructive migration gerekiyorsa önce `RISK REPORT — Prisma migration` üret.

---

# PROMPT 05 — Koç ödev formunu alpha seviyeye çıkar

**Amaç:** Basit başlık formunu gerçek alpha forma dönüştürmek.

**Okunacak dosyalar:**

- `apps/web/app/coach/assignments/create/page.tsx`
- `apps/web/components/demo-flow/CreateAssignmentPanel.tsx`
- `apps/web/app/api/coach/assignments/route.ts`

**Yapılacaklar:**

1. Forma `title`, `description`, `type`, `priority`, `subject`, `dueDate` ekle.
2. Basit client validation ekle.
3. Başarılı kayıt sonrası ödev özeti göster.
4. Mobilde tek kolon düzen kullan.

**Yapılmayacaklar:** Quill, Dropzone, Select2, çoklu öğrenci, bulk akış ekleme.

**Test:** `pnpm typecheck`, `pnpm --filter @uyanik/web test:e2e`

**Commit mesajı:** `feat: upgrade coach assignment form`

**Dur:** Yeni dependency gerekirse raporla.

---

# PROMPT 06 — Öğrenci ve veli ekranlarını yeni ödev verisine bağla

**Amaç:** Assignment alpha alanlarını öğrenci ve veli tarafında görünür yapmak.

**Okunacak dosyalar:**

- `apps/web/components/demo-flow/StudentAssignmentList.tsx`
- `apps/web/components/student/StudentDashboard.tsx`
- `apps/web/components/parent/ParentDashboard.tsx`
- `apps/web/app/api/student/assignments/route.ts`
- `apps/web/app/api/parent/summary/route.ts`

**Yapılacaklar:**

1. Öğrenci listesinde durum, öncelik, son tarih, ders/tür göster.
2. Tamamla butonu sadece açık ödevlerde görünsün.
3. Veli dashboard'a kural tabanlı haftalık yorum kartı ekle.
4. OpenAI veya başka AI çağrısı yapma.

**Test:** `pnpm typecheck`, `pnpm --filter @uyanik/web test`, `pnpm --filter @uyanik/web test:e2e`

**Commit mesajı:** `feat: show assignment details in student and parent views`

**Dur:** Demo akışı kırılırsa raporla.

---

# PROMPT 07 — AI Koç Yakında yüzeyi

**Amaç:** AI canlı değilken ürün farklılaştırmasını görünür tutmak.

**Okunacak dosyalar:**

- `apps/web/components/layout/Sidebar.tsx`
- `apps/web/components/student/StudentDashboard.tsx`
- `.env.example`
- `apps/web/.env.production.example`

**Yapılacaklar:**

1. `/student/ai-coach` sayfası ekle: `AI Koç Yakında`.
2. Sidebar'a `AI Koç · Yakında` ekle.
3. Student dashboard'a küçük yakında bandı ekle.
4. `/api/ai-coach` placeholder ekle. Feature flag kapalıysa canlı cevap üretmesin.

**Yapılmayacaklar:** OpenAI SDK, streaming, upload, vision ekleme.

**Test:** `pnpm typecheck`, `pnpm --filter @uyanik/web test:e2e`

**Commit mesajı:** `feat: add ai coach coming soon surface`

**Dur:** External API çağrısı gerekecekse raporla.

---

# PROMPT 08 — Rules-v1 risk ve öneri

**Amaç:** AI kullanmadan ilk akıllı değer katmanını eklemek.

**Okunacak dosyalar:**

- `packages/shared/src/index.ts`
- `apps/web/components/coach/CoachDashboard.tsx`
- `apps/web/components/parent/ParentDashboard.tsx`
- `apps/web/components/student/StudentDashboard.tsx`
- `apps/web/lib/data/assignments.ts`

**Yapılacaklar:**

1. Pure helper fonksiyonlar ekle: completion rate, overdue count, rules-based risk, coach suggestion, parent weekly comment.
2. Koç dashboard'da risk kartı göster.
3. Veli dashboard'da yorum kartı göster.
4. Öğrenci dashboard'da bugünkü öncelik kartı göster.

**Yapılmayacaklar:** DB RiskScore tablosu, cron, worker, AI ekleme.

**Test:** `pnpm --filter @uyanik/shared test`, `pnpm typecheck`, `pnpm --filter @uyanik/web test`

**Commit mesajı:** `feat: add rules based risk suggestions`

**Dur:** Pure helperlar UI içine gömülecekse raporla.

---

# PROMPT 09 — DB-backed alpha doğrulaması

**Amaç:** Memory store dışında gerçek PostgreSQL ile akışın çalışmasını sağlamak.

**Okunacak dosyalar:**

- `packages/database/src/client.ts`
- `packages/database/src/repositories/auth.ts`
- `packages/database/src/repositories/assignments.ts`
- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/seed.ts`
- `apps/web/lib/auth/resolve-user.ts`
- `apps/web/lib/data/env.ts`

**Yapılacaklar:**

1. `DEMO_AUTH_ALLOW_IN_MEMORY=false` ve `DATABASE_URL` varken auth DB'den çalışsın.
2. Seed sonrası demo kullanıcılar login olabilsin.
3. Koç ödev oluşturunca DB'ye yazılsın.
4. Öğrenci tamamlayınca DB update olsun.
5. Veli summary DB'den gelsin.

**Test:** `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm typecheck`

**Commit mesajı:** `fix: verify db backed alpha flow`

**Dur:** Migration veya seed idempotent değilse raporla.

---

# PROMPT 10 — Branch/Admin minimal shell

**Amaç:** RBAC'ta var olan branch/admin rolleri boş görünmesin, franchise karmaşıklığı açılmasın.

**Okunacak dosyalar:**

- `apps/web/app/branch/dashboard/page.tsx`
- `apps/web/app/admin/dashboard/page.tsx`
- `apps/web/components/layout/Sidebar.tsx`
- `apps/web/lib/rbac.ts`

**Yapılacaklar:**

1. Branch ve admin için minimal AppLayout kullan.
2. Branch menüsü: Dashboard, Öğrenciler, Koçlar, Raporlar.
3. Admin menüsü: Dashboard, Kullanıcılar, Sistem Sağlığı.
4. Sayfalara `single-branch alpha` açıklaması ekle.

**Yapılmayacaklar:** CRUD, organization switcher, CRM entegrasyonu ekleme.

**Test:** `pnpm typecheck`, `pnpm --filter @uyanik/web test:e2e`

**Commit mesajı:** `feat: add minimal branch admin shells`

**Dur:** 10 dosya sınırı aşılırsa raporla.

---

# PROMPT 11 — CI kalite kapısı

**Amaç:** Her push'ta minimum kalite kontrolü çalışsın.

**Okunacak dosyalar:** `package.json`, `apps/web/package.json`, `pnpm-workspace.yaml`, `turbo.json`, varsa `.github/workflows/*`.

**Yapılacaklar:**

1. `.github/workflows/ci.yml` ekle.
2. CI adımları: install, db generate, typecheck, lint, unit test.
3. E2E başlangıçta manual veya ayrı job olabilir.
4. External secret gerektirme.

**Test:** `pnpm typecheck`, `pnpm lint`, `pnpm test:unit`

**Commit mesajı:** `ci: add basic quality gate`

**Dur:** CI external secret isterse raporla.

---

# PROMPT 12 — Deploy kararı dokümantasyonu

**Amaç:** Production self-host, Vercel preview/demo kararını netleştirmek.

**Okunacak dosyalar:** `.env.example`, `apps/web/.env.production.example`, varsa `deploy/*`, varsa `README.md`, varsa `vercel.json`.

**Yapılacaklar:**

1. `docs/deploy/DEPLOYMENT_DECISION.md` ekle.
2. Production: kendi sunucu + ayrı app/db/upload/log.
3. Vercel: preview/demo/landing için kullanılabilir.
4. CRM izolasyon kararını yaz.
5. Vercel config değiştirme; gerekirse raporla.

**Test:** `pnpm typecheck`

**Commit mesajı:** `docs: document deployment decision`

**Dur:** Deploy config değişikliği gerekiyorsa raporla.

---

# PROMPT 13 — Alpha durum raporu

**Amaç:** Kod değiştirmeden sprint sonu durum raporu üretmek.

**Okunacak dosyalar:** README, AGENTS, package dosyaları, Prisma schema, assignment API route'ları, test klasörleri.

**Yapılacaklar:**

1. `docs/reports/ALPHA_STATUS_REPORT.md` oluştur.
2. İçerik: tamamlananlar, riskler, test durumu, DB-backed alpha, mobil/worker, AI Koç, sonraki 5 öncelik.
3. Kod değiştirme.

**Commit mesajı:** `docs: add alpha status report`

**Dur:** Bu sprint kapanışıdır. Yeni feature başlatma.

---

## Cursor'a verilecek başlatma mesajı

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
