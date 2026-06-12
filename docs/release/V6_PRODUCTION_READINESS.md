# Uyanik Koc Web V6 - Production Readiness Check

## Production DB Migration Status - 2026-06-12

Status: DB MIGRATED, REDEPLOY PENDING.

- Env was loaded from the local external env file without writing secret values to repo docs or logs.
- Neon restore path exists via backup branch `pre-v6-migration-backup`; migration used the main direct/unpooled Neon URL (`pooler=false`, host masked).
- Pre-migration DB state: 31 applied migrations, latest `20260611193000_login_attempts`; V6 migrations were pending.
- Migration preflight found no `DROP TABLE`, `DROP COLUMN`, or destructive rename. `20260612130000_mistake_topic_nullable` only relaxes `topic` with `DROP NOT NULL`.
- Applied V6 migrations: `20260612120000_mistakes`, `20260612130000_mistake_topic_nullable`, `20260612190000_thread_member_read_mute`, `20260612200000_notification_coach_scope`.
- Post-migration DB state: 35 applied migrations, latest `20260612200000_notification_coach_scope`.
- Verification passed: `pnpm install --frozen-lockfile`, `pnpm db:generate`, `pnpm db:migrate`, `pnpm typecheck`, `pnpm lint`, `pnpm test:unit`, `pnpm --filter @uyanik/web build`.
- Redeploy was not run because the production SSH/CI/restart target is still not provided; smoke tests remain pending after redeploy.

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

Status: BLOCKED before backup/migration.

Preflight on 2026-06-12 initially found the current Codex shell did not expose production readiness env values. After loading the user-provided local env file, the guarded read-only DB preflight was rerun without logging secrets.

- `DATABASE_URL`: present, masked Neon host confirmed
- `AUTH_SECRET` or `NEXTAUTH_SECRET`: present
- `DEMO_AUTH_ALLOW_IN_MEMORY=false`: confirmed
- `AI_COACH_ENABLED=false`: confirmed
- DB read-only migration table check: OK
- Current DB applied migration count: 31
- Current DB latest applied migration: `20260611193000_login_attempts`
- Pending V6 migrations: `20260612120000_mistakes`, `20260612130000_mistake_topic_nullable`, `20260612190000_thread_member_read_mute`, `20260612200000_notification_coach_scope`
- Backup tool: `pg_dump` not available in current shell
- Connection note: current `DATABASE_URL` host is Neon but uses pooler; migration should prefer direct/unpooled URL

Result:

- Backup was not attempted.
- `pnpm db:migrate` was not run.
- Production build was not run because backup/migration precondition failed.
- Redeploy pending: SSH/CI target required.

Required next input:

- Install PostgreSQL client tools so `pg_dump` is available, or create a Neon restore point/backup and provide confirmation.
- Use a direct/unpooled Neon migration URL for `DATABASE_URL` before running Prisma migrations.
