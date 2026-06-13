# Uyanik Koc Web V6 - Production Readiness Check

## Reality Parity Delta - 2026-06-13

Status: CODE READY LOCALLY, REDEPLOY PENDING FOR THIS DELTA.

- No DB migration, schema change, backend feature, CRM change, AI integration, or secret change was made.
- `/coach/topics` was rechecked against Claude Design source/spec and fixed without producing new design.
- Local browser QA passed: desktop 1440, mobile 390, `.ktx=1`, `.ktx table=0`, `.ktx-topic=2`, Ödev Ata modal opens, no horizontal overflow.
- Evidence screenshots are stored in `docs/cursor/visual-checks/`.
- Production remains healthy from the previous deployment, but this new local delta is not redeployed until the next production deploy command is run.

## Final Production Smoke Status - 2026-06-12

Status: REDEPLOYED, SMOKE PASSED WITH MAIL RISK.

- Final all-areas Claude Design parity audit completed after `5b734f6`; 37 live Playwright visual checks passed with 0 failures.
- No-new-design contract addendum applied: route/component mapping now records source/spec, target, required layout blocks, required states, mismatch, applied fix, and QA result.
- Codex yeni tasarim uretmedi; tum UI degisiklikleri Claude Design handoff/spec/source prototype ile eslendi. Kaynakta olmayan hicbir component, renk, spacing, flow veya veri uydurulmadi.
- Coach notifications route was added and redeployed; `/coach/notifications` now renders the shared guarded notifications panel with read and mark-all support.
- Current deployed code: `5b734f6` (`fix(design): add coach notifications parity route`), deployed to Vercel production and aliased to `https://koc.uyanik.com.tr`.
- DB migration was not rerun; Neon main remains at latest migration `20260612200000_notification_coach_scope`.
- `/api/health` returned `{"status":"ok","authSecret":"ok"}` on the live domain.
- Production demo role smoke passed for student, coach, and parent with approved demo accounts.
- `/coach/topics` now uses the Claude v5/v6 `.ktx` rail + topic-card view as the primary view; generic `KonuCizelge` table is not rendered inside `.ktx`.
- Live desktop/mobile browser QA screenshots were captured at `%TEMP%/v6-live-coach-topics-desktop.png` and `%TEMP%/v6-live-coach-topics-mobile.png`.
- Remaining risk: production password-reset email is not deliverable until `RESEND_API_KEY` has a real non-empty value.

## Production Redeploy + Smoke Status - 2026-06-12

Status: SUPERSEDED BY FINAL PRODUCTION SMOKE STATUS ABOVE.

- Production redeploy completed from `main` commit `68ad23b`; Vercel build completed and aliased `https://koc.uyanik.com.tr`.
- DB migration was not rerun.
- Live `/api/health` returned `{"status":"ok"}`. The current health route does not expose an `authSecret` field, so `authSecret: ok` cannot be directly asserted from this endpoint.
- Production login with the documented organization owner account succeeded and remained valid after reload on `/yonetim/dashboard`.
- Student, coach, and parent smoke login with documented demo accounts was rejected on production DB; V6 student/coach/parent flows were not fully smoke-tested.
- Blocking item: provide valid production student/coach/parent smoke credentials or seed/enable approved production smoke accounts, then rerun the role flow checklist.

## Production DB Migration Status - 2026-06-12

Status: REDEPLOYED, SMOKE BLOCKED.

- Code ready: yes
- DB migrated: yes
- Build/test passed: yes
- Redeploy: yes
- Smoke test: blocked
- Blocking item: valid production student/coach/parent smoke credentials required

- Env was loaded from the local external env file without writing secret values to repo docs or logs.
- Neon restore path exists via backup branch `pre-v6-migration-backup`; migration used the main direct/unpooled Neon URL (`pooler=false`, host masked).
- Pre-migration DB state: 31 applied migrations, latest `20260611193000_login_attempts`; V6 migrations were pending.
- Migration preflight found no `DROP TABLE`, `DROP COLUMN`, or destructive rename. `20260612130000_mistake_topic_nullable` only relaxes `topic` with `DROP NOT NULL`.
- Applied V6 migrations: `20260612120000_mistakes`, `20260612130000_mistake_topic_nullable`, `20260612190000_thread_member_read_mute`, `20260612200000_notification_coach_scope`.
- Post-migration DB state: 35 applied migrations, latest `20260612200000_notification_coach_scope`.
- Verification passed: `pnpm install --frozen-lockfile`, `pnpm db:generate`, `pnpm db:migrate`, `pnpm typecheck`, `pnpm lint`, `pnpm test:unit`, `pnpm --filter @uyanik/web build`.
- Redeploy was run on Vercel and aliased to the live domain; student/coach/parent role smoke remains blocked by missing valid production smoke credentials.

Date: 2026-06-12
Scope: release / production readiness only. No feature, UI, backend, dependency, or migration changes were made in this phase.

## Go / No-Go Summary

Status: GO for controlled production rollout after the checklist below is completed on the target self-host environment.

Conditions:

- Production must use self-host deployment, not Vercel production, per `docs/deploy/DEPLOYMENT_DECISION.md`.
- Production database backup must be taken before migrations.
- Production env must be verified before build/start.
- Smoke tests must pass after deploy.
- Non-blocking visual/data-contract items below remain accepted and must not be treated as hidden production blockers.

## V6 Migration List

Apply migrations in Prisma chronological order with `pnpm db:migrate`.

| Order | Migration | Purpose | Blocking |
|---:|---|---|---|
| 1 | `20260612120000_mistakes` | Adds `MistakeErrorType`, `MistakeQuestionType`, `MistakeStatus`, `mistakes`, `mistake_reviews`, indexes, and student/mistake FKs. | Yes |
| 2 | `20260612130000_mistake_topic_nullable` | Makes `mistakes.topic` nullable so optik/exam records without topic do not fabricate topic data. | Yes |
| 3 | `20260612190000_thread_member_read_mute` | Adds `ThreadMember.lastReadAt` and `ThreadMember.muted` for persistent read/mute state. | Yes |
| 4 | `20260612200000_notification_coach_scope` | Adds `Notification.coachId`, index, and FK to `coach_profiles` for coach notification DB scope. | Yes |

No P6-P8 migrations were added: NetGainMap, SmartOdev, and Takvimim agenda are derived from existing tables/services. P9 and P10 are covered above.

## Production Deploy Order

1. Backup production PostgreSQL.
   - Capture a restorable DB backup/snapshot.
   - Record backup timestamp and target DB identifier.
2. Verify production env.
   - Confirm values in the checklist below.
   - Confirm CRM env/upload/log paths are separate and untouched.
3. Install dependencies from repository root.
   - `pnpm install`
4. Generate Prisma client.
   - `pnpm db:generate`
5. Apply DB migrations.
   - `pnpm db:migrate`
6. Build web app.
   - `pnpm --filter @uyanik/web build`
7. Start or redeploy the self-host process.
   - Example: `pnpm --filter @uyanik/web start` behind the existing process manager/reverse proxy.
8. Run smoke tests.
   - Use the checklist below.
9. Monitor.
   - Watch app logs, auth errors, DB errors, and notification/message behavior for the first production window.

## Production Env Checklist

Required:

- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` points to the production PostgreSQL database, not local/dev/preview.
- [ ] `AUTH_SECRET` is present, strong, and stable.
- [ ] `NEXTAUTH_SECRET` is present, strong, and stable. It may match `AUTH_SECRET`.
- [ ] `AUTH_URL` is the production URL with no trailing slash.
- [ ] `NEXTAUTH_URL` is the production URL with no trailing slash.
- [ ] `DEMO_AUTH_ALLOW_IN_MEMORY=false`
- [ ] `AI_COACH_ENABLED=false`
- [ ] `SINGLE_BRANCH_MODE=true`
- [ ] `KOC_UPLOAD_DIR` is an app-owned path, not a CRM upload path.
- [ ] `KOC_LOG_DIR` is an app-owned path, not a CRM log path.
- [ ] CRM database/env/upload/log areas are not shared with this app.
- [ ] Licensed Metronic assets, if required by the target deployment, are copied through a safe deployment path and not committed to git.

Optional / operational:

- [ ] `RESEND_API_KEY` and `MAIL_FROM` are configured if transactional email is expected.
- [ ] `SMS_PROVIDER=netgsm` and `NETGSM_*` values are configured if live SMS is expected.
- [ ] `DEFAULT_ORGANIZATION_ID` and `DEFAULT_BRANCH_ID` are set only if production flow depends on seed-compatible defaults.

## Smoke Test Checklist

Run after deploy against the production URL.

- [ ] Student login succeeds.
- [ ] Student `/student/mistakes` loads list/summary.
- [ ] Student can add a mistake.
- [ ] Student can complete a mistake review flow.
- [ ] Optik submission with wrong/blank answers feeds Yanlis Defteri without duplicates on repeat processing.
- [ ] Student dashboard shows Takvimim agenda.
- [ ] Student exams show NetGainMap.
- [ ] Coach login succeeds.
- [ ] Coach roster student detail shows mistake insight only for roster student.
- [ ] Coach SmartOdev preview works without DB write.
- [ ] Coach SmartOdev assign creates an assignment for a roster student.
- [ ] Parent login succeeds.
- [ ] Parent dashboard shows read-only mistake/net insight for own child only.
- [ ] Message thread open marks read and clears unread badge.
- [ ] Message mute persists after refresh/reload.
- [ ] Student/parent notification read works.
- [ ] Coach notification read and mark-all works with DB-backed `coachId` scope.
- [ ] `/api/health` returns healthy status and auth secret is not missing.

## Non-Blocking Accepted Items

These are accepted release notes, not blockers for this readiness phase:

- Mobile/modal PNG visual QA is still missing; browser/manual QA remains required before pixel sign-off.
- Coach topics PNG is missing from the handoff package; browser/manual QA remains required before pixel sign-off.
- AssignmentResult question-level payload is missing, so assignment-result mistake ingestion is intentionally limited. No question text/topic is fabricated.
- Object storage/photo upload is not implemented; Yanlis Defteri rejects dataURL/base64 and does not store embedded image payloads in DB.
- Generic v6 message/notification wrapper routes were not added because existing role-based guarded routes are preserved.

## Rollback Notes

- If build fails before migration: do not deploy; keep current production version running.
- If migration fails: stop rollout, restore from backup if partial migration leaves production unusable, and collect Prisma/PostgreSQL logs.
- If smoke tests fail after migration but app starts: decide between forward fix and rollback based on affected user path; preserve DB backup and application logs.
- Do not enable memory fallback in production as a rollback shortcut.
- Do not add fallback auth secrets or commit `.env` files.

## Final Verification Commands

These commands were run for release readiness on 2026-06-12:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test:unit`
- `AUTH_SECRET=local-ci-build-secret-not-for-production-32chars NEXTAUTH_SECRET=local-ci-build-secret-not-for-production-32chars pnpm --filter @uyanik/web build`

Final command results must be recorded in `docs/cursor/CURSOR_RUN_LOG.md` for the release readiness commit.

## Production DB Migration Status

Status: DB MIGRATED, REDEPLOY PENDING.

Preflight on 2026-06-12 initially found the current Codex shell did not expose production readiness env values. After loading the user-provided local env file, DB preflight and migration were completed without logging secrets.

- `DATABASE_URL`: present, masked Neon host confirmed
- `AUTH_SECRET` or `NEXTAUTH_SECRET`: present
- `DEMO_AUTH_ALLOW_IN_MEMORY=false`: confirmed
- `AI_COACH_ENABLED=false`: confirmed
- DB migration table check: OK
- Final DB applied migration count: 35
- Final DB latest applied migration: `20260612200000_notification_coach_scope`
- Applied V6 migrations: `20260612120000_mistakes`, `20260612130000_mistake_topic_nullable`, `20260612190000_thread_member_read_mute`, `20260612200000_notification_coach_scope`
- Backup/restore path: Neon branch `pre-v6-migration-backup`
- Connection note: direct/unpooled Neon URL was used for migration

Result:

- V6 DB migration completed.
- `pnpm db:migrate` passed.
- Production build and test gate passed.
- Redeploy pending: SSH/CI target required.

Required next input:

- Provide production SSH/CI/restart target for redeploy.
- Run the smoke test checklist after redeploy.
