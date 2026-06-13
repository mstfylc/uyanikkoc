# Uyanık Koç — DB & Canlı Test Sertleştirme Prompt Seti

Bu dosya, canlı kullanıcı testi öncesi DB performans/operasyon iyileştirmeleri
için sıralı Codex/Cursor prompt'larını içerir. Sıra önemlidir ama prompt'lar
bağımsız commit'lenebilir. Her prompt sonunda `docs/cursor/LATEST_HANDOFF.md` ve
`docs/cursor/CURSOR_RUN_LOG.md` güncellenir; risk varsa `RISK_REPORT.md`.

Genel kurallar `AGENTS.md` ve `CURSOR_PROMPT_LIST.md`'den gelir:
test/typecheck/lint geçmeden commit yok; destructive migration'da DUR;
CRM/auth/RBAC/Metronic/AI alanlarına dokunma.

Sıra: **P-DB-1 → P-DB-2 → P-DB-3 → P-OPS-1 → P-TEST-1**

---

## P-DB-1 — Performans composite indeksleri

**Amaç:** Yüksek hacimli tablolarda sıralı/filtreli sorguları hızlandır. Yeni
kolon/feature YOK; yalnızca indeks ekle.

**Oku:**
- `packages/database/prisma/schema.prisma`
- `docker-compose.dev.yml`

**Yap:**
1. schema.prisma'da yalnızca şu indeksleri EKLE (mevcutları değiştirme):
   - `Notification`: `@@index([studentId, read, createdAt])`
   - `Message`: `@@index([threadId, createdAt])`
   - `Assignment`: `@@index([studentId, status])`
   - `ExamResult`: `@@index([studentId, takenAt])`
2. `pnpm --filter @uyanik/database migrate:dev --name perf_indexes` ile migration üret.
3. Üretilen SQL yalnızca `CREATE INDEX` içermeli. DROP/ALTER/RENAME varsa DUR → RISK REPORT.

**Yapma:** Kolon/model/ilişki değişikliği; mevcut indeks silme.

**Kabul:** schema diff'i yalnızca 4 yeni `@@index`; migration yalnızca CREATE INDEX.

**Test:** `pnpm db:generate && pnpm typecheck && pnpm lint && pnpm test:unit`
(mümkünse lokal PG ile `pnpm db:migrate`).

**Commit:** `perf(db): add composite indexes for hot-path queries`

**⚠️ Production notu (rapora yaz):** Dolu DB'de `CREATE INDEX` kısa kilit yaratır.
Production'da düşük trafik penceresinde uygula veya elle
`CREATE INDEX CONCURRENTLY` (Prisma transaction içinde CONCURRENTLY çalışmaz).

---

## P-DB-2 — Süresi geçmiş auth/token cleanup job'u

**Amaç:** `RefreshToken`, `PasswordResetToken`, `OtpChallenge` tablolarında
süresi geçmiş satırların süresiz büyümesini engelle. (`LoginAttempt` zaten
mevcut akışta temizleniyor — davranışını bozma.)

**Oku:**
- `packages/database/src/repositories/auth.ts`
- `packages/database/src/index.ts`
- `apps/worker/src/index.ts`
- `apps/worker/src/jobs/assignment-reminder.ts`

**Yap:**
1. `auth.ts`'e mevcut pattern'e uygun `purgeExpiredAuthArtifacts(now: Date)` ekle:
   `refreshToken`, `passwordResetToken`, `otpChallenge` için `expiresAt < now`
   koşuluyla `deleteMany`. Silinen toplam satır sayısını döndür. Mevcut
   `authRepository` namespace'i üzerinden erişilebilir kalsın (yeni export icat etme).
2. `apps/worker/src/jobs/token-cleanup.ts` oluştur: `runTokenCleanupJob()`
   `purgeExpiredAuthArtifacts(new Date())` çağırsın. `assignment-reminder.ts`
   stub stilini birebir izle; harici cron/scheduler EKLEME.
3. `apps/worker/src/index.ts`'ten `runTokenCleanupJob` export et.
4. Unit test ekle: süresi geçmiş kayıtlar siliniyor, geçerliler kalıyor.
   Repodaki mevcut test/mock yaklaşımını kullan; yeni test altyapısı kurma.

**Yapma:** `LoginAttempt` temizlik davranışını değiştirme; client.ts'e dokunma.

**Kabul:** Job çağrılabilir + export edilmiş; test yeşil.

**Test:** `pnpm db:generate && pnpm typecheck && pnpm lint && pnpm test:unit`

**Commit:** `feat(worker): add expired auth/token cleanup job`

---

## P-DB-3 — `Assignment.parentId` referans bütünlüğü (FK)

**Amaç:** `Assignment.parentId` şu an FK'sız denormalize String. Veri
bütünlüğü için `ParentProfile`'a gerçek ilişki bağla.

**Oku:**
- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/seed.ts` (parentId nasıl set ediliyor)
- `packages/database/src/repositories/assignments.ts`

**Yap (DİKKAT — referans doğrulama şart):**
1. Önce mevcut `assignments.parentId` değerlerinin tümünün geçerli bir
   `parent_profiles.id`'ye karşılık geldiğini doğrula (lokal/dev DB'de kontrol
   sorgusu). **Orphan (eşleşmeyen) varsa DUR → RISK REPORT** (backfill kararı
   Mustafa'ya bırakılır).
2. Orphan yoksa: schema'da `Assignment.parent ParentProfile @relation(...)`
   ilişkisini ekle; `ParentProfile`'a karşı tarafı (`assignments Assignment[]`)
   ekle. `onDelete` davranışını mevcut konvansiyonla seç (öğrenci/koç Cascade;
   veli silindiğinde ödev kaybolmamalı → `SetNull` gerekiyorsa `parentId`'yi
   `String?` yap, aksi halde `Restrict`). Kararı tek cümleyle rapora yaz.
3. `migrate:dev --name assignment_parent_fk` ile migration üret. SQL yalnızca
   FK/constraint (gerekirse nullable) içermeli; veri silen ifade OLMAMALI.

**Yapma:** Mevcut assignment iş mantığını/sorgularını yeniden yazma.

**Kabul:** FK kuruldu; orphan yok; migration non-destructive; testler yeşil.

**Test:** `pnpm db:generate && pnpm typecheck && pnpm lint && pnpm test:unit`

**Commit:** `fix(db): add FK integrity for assignment parent reference`

---

## P-OPS-1 — Connection pooling & Prisma production sertleştirme

**Amaç:** Serverless'te bağlantı tükenmesini önle ve pooled `DATABASE_URL`
kullanımını garanti altına al. **Kod minimal, kırıcı değişiklik yok.**

**Oku:**
- `packages/database/src/client.ts`
- `apps/web/.env.production.example`
- `docs/deploy/DEPLOYMENT_DECISION.md`
- `README.md`

**Yap:**
1. `client.ts`: Prisma singleton'ı production'da da `globalThis` üzerinde
   cache'le (şu an yalnızca non-prod). Bağlantı string'ini, memory mantığını
   DEĞİŞTİRME — sadece tekrar `new PrismaClient()` üretimini engelle.
2. Production'da `DATABASE_URL` pooled endpoint değilse (örn. Neon'da host
   `-pooler` içermiyorsa) başlangıçta **fatal olmayan** bir `console.warn`
   bas. Throw ETME (migration direct URL kullanabilir). Heuristik basit olsun.
3. `apps/web/.env.production.example` ve `README.md`'ye kısa not: runtime'da
   pooled URL, migration'da direct URL kullanılır.

**Yapma:** Bağlantıyı throw ile zorlama; `DEMO_AUTH_ALLOW_IN_MEMORY` ve
`assertProductionMemoryPolicy` mantığına dokunma.

**Kabul:** Prod'da tek client; pooled-değil URL'de uyarı; testler yeşil.

**Test:** `pnpm db:generate && pnpm typecheck && pnpm lint && pnpm test:unit`

**Commit:** `perf(db): reuse prisma client in production + pooled url guard`

---

## P-TEST-1 — Yük testi harness'i (kapasite ölçümü)

**Amaç:** Kapasiteyi tahmin değil **ölçü**lebilir yap. Tek tekil dev-dependency
(k6 binary harici; script repo'da) ile temel senaryolar.

**Oku:**
- `scripts/` (mevcut script stili)
- `apps/web/app/api/health/route.ts`
- `README.md`

**Yap:**
1. `scripts/load/` altına k6 senaryoları ekle (düz `.js`):
   - `health.js`: `/api/health` baseline (ramp 1→50 VU).
   - `auth-login.js`: demo login akışı (env'den base URL + demo kimlik).
   - `student-read.js`: login sonrası öğrenci dashboard/ödev okuma akışı.
2. `scripts/load/README.md`: nasıl çalıştırılır (`k6 run`), hangi ortam
   değişkenleri, hedef metrikler (p95 latency, error rate, eşzamanlı VU tavanı).
   k6 kurulu değilse repoya binary EKLEME; yalnızca komutu dokümante et.
3. Ana `README.md`'ye tek satır referans: "Yük testi: `scripts/load/`".

**Yapma:** CI'a zorunlu yük testi ekleme (ayrı/opsiyonel job); production'a
canlı yük testi çalıştırma talimatı verme — yalnızca staging hedefle.

**Kabul:** k6 scriptleri lint-temiz; README açık; uygulama koduna dokunulmadı.

**Test:** `pnpm typecheck && pnpm lint` (scriptler uygulama derlemesine girmez).

**Commit:** `test(load): add k6 capacity test harness for staging`

---

## Kapanış

Tüm prompt'lar bittiğinde `LATEST_HANDOFF.md`'de tek bakış özeti olmalı:
indeksler, cleanup job, parentId FK, pooling guard, yük testi harness'i.
Production'a uygulama sırası: önce migration penceresi (P-DB-1/3), sonra
deploy (P-OPS-1), sonra staging'de yük testi (P-TEST-1).
