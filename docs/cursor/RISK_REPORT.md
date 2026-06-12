# Risk Report - Web v6 Final

**Tarih:** 2026-06-12  
**Son faz:** Web v6 Final Release / Production Readiness Check  
**Durum:** release readiness clear

## Release Readiness Status

Status: clear

Production readiness dokumani hazirlandi. Aktif release blokaj riski tespit edilmedi; non-blocking kalanlar mobile/modal/coach topics PNG QA, AssignmentResult question-level payload eksigi ve object storage/photo upload eksigidir. `pnpm typecheck`, `pnpm lint`, `pnpm test:unit` ve gecici local CI secret env ile web build gecti.

## Production DB Preflight - Blocked

Status: blocked

After loading the local env file without logging secrets, production guard passed and read-only Neon DB migration table access succeeded. Current DB has 31 applied migrations, latest `20260611193000_login_attempts`; V6 migrations are pending.

Migration remains blocked because `pg_dump` is not available in the current shell and the current Neon URL is pooled. Per release rules, no backup means no migration; Prisma migration should also prefer direct/unpooled Neon URL. No backup, `pnpm db:migrate`, build, or redeploy was run.

Required resolution: install PostgreSQL client tools for `pg_dump` or create/confirm a Neon restore point, then rerun with a direct/unpooled Neon migration `DATABASE_URL`. Secret values must remain masked and must not be written to repo files.

## Production DB Migration Status - 2026-06-12

Status: clear for DB migration; redeploy pending.

Neon backup branch `pre-v6-migration-backup` exists, main direct/unpooled DB URL was used with `pooler=false`, and V6 migrations were applied successfully. Post-migration latest migration is `20260612200000_notification_coach_scope`.

Remaining non-code release risk: production redeploy and smoke tests were not run because SSH/CI/restart target is still not available. No secret values or env files were committed.

## P10 Status

Status: clear

Coach notifications DB scope tamamlandi; `Notification.coachId` nullable scope ile eklendi, coach list/read/mark-all DB modunda `coachId` filtresiyle calisir. `pnpm db:generate`, `pnpm typecheck`, `pnpm lint`, `pnpm test:unit` ve gecici local CI secret env ile web build gecti. Aktif P10 riski yok.

## P11 Status

Status: clear

Final audit cleanup docs-only tamamlandi. Aktif kod riski yok; kalan mobile/modal/coach topics PNG eksigi browser/manual visual QA notu olarak tutuldu, cozuldu diye isaretlenmedi.

## P1 Status

Status: clear

P1 token/style parity değişiklikleri uygulandı; `pnpm typecheck`, `pnpm lint` ve geçici local CI secret env ile `pnpm --filter @uyanik/web build` geçti.

Önceki build blokajı kod/tasarım hatası değil, production build için beklenen `AUTH_SECRET`/`NEXTAUTH_SECRET` env eksikliğiydi. Secret dosyaya yazılmadı, fallback secret eklenmedi. Mobile/modal PNG eksikliği ve v6 feature/backend eksikleri bu fazın kapsamı dışındadır.

## Accepted P0 Risk Record

Sebep: P0 envanteri tamamlandı; implementation'a geçmeden kabul/onay gerektiren gap/riskler kullanıcı tarafından kabul edildi.

Etkilenen alan:

- Design token gate: `apps/web/styles/uk-design.css` light `--muted` halen `#767A90`; v6 hedef `#6B6F85`. Dark `--surface` ve dark neutral token seti v6 `tokens/colors.json` ile uyumsuz.
- Görsel QA: handoff paketinde mobile PNG ve modal PNG yok; `coach/c-topics` desktop PNG yok. Gerçek browser regenerate veya spec tabanlı QA gerekli.
- Student v6 route: `/student/mistakes` canlı repoda yok; nav item yok; Yanlış Defteri component/API/service/repository/Prisma modeli yok.
- Backend gaps: `Mistake`/`MistakeReview` yok; NetGainMap, SmartOdev, Takvimim aggregation endpointleri yok.
- Messaging gaps: DB-backed mesajlaşma mevcut ama unread/read/mute kalıcılığı için `ThreadMember.lastReadAt`/`muted` yok; coach notifications DB-backed değil.
- Assignment gaps: `Assignment`/`AssignmentResult` mevcut ama v6 smart assignment için topic/source/questionCount/weekKey/feedback/smart/quality/overdueAlert alanları yok.
- Storage: Yanlış Defteri fotoğrafı için object storage yok; dataURL/base64 DB'ye yazılmamalı.
- Route adaptation: handoff route önerileri canlı `/student/dashboard`, `/coach/dashboard`, `/parent/dashboard` yapısına uyarlanmalı; mevcut ekranlar silinmemeli.

Öneri:

- P1'de yalnız token/style parity gate uygulanmalı ve testler çalıştırılmalı.
- P2'den itibaren her faz 8-10 dosya sınırını aşmayacak şekilde bölünmeli; `Mistake` backend önce DB/service/repository/API olarak eklenmeli.
- Mobile/modal görseller için gerçek browser regenerate denenmeli; olmazsa `V6_FINAL_VISUAL_ACCEPTANCE.md` spec tabanlı QA ile işaretlenmeli.
- Generic API isimleri canlı route düzeniyle çakışırsa mevcut rol bazlı route'lar korunup wrapper/alias ihtiyacı ayrıca onaylanmalı.

P0 riskleri kullanıcı tarafından kabul edildi; P1 token/style parity tamamlandı. Kapsam dışı işler sonraki fazlara bırakıldı.

---

## Önceki Risk Kayıtları

### Faz 2 kapanış - 2026-06-05

Additive migration `20260604210000_faz2_skeletons`; yerel/CI için `pnpm db:migrate` gerekir.

### BACKLOG PROMPT 18 - 2026-06-04

Deneme sonuçları (YKS alpha). Additive migration; yerel/CI DB için `pnpm db:migrate` gerekir.

### BACKLOG PROMPT 17 - 2026-06-04

Kullanıcı tanımlı konu takibi. Additive migration; yerel/CI DB için `pnpm db:migrate` gerekir.

### BACKLOG PROMPT 14 - 2026-06-03

Assignment service layer refactor only. Risk yok; davranış değişmedi, yeni tablo/endpoint/dependency yok.

### PROMPT 09 - 2026-06-04

Eski blokaj `DATABASE_URL` yoktu; yerel Postgres docker-compose ile çözüldü.

---

## P5 Kapanis - 2026-06-12

Risk yok. Koc/veli Yanlis Defteri insight read mount roster ve parent child-scope guard ile tamamlandi; write aksiyonu eklenmedi.
