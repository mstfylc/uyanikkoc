# Uyanik Koc Screen Implementation Plan

## Scope

- Source designs:
  - `C:/Users/musta/Downloads/Uyanik Koc - Dashboard Redesign (3).html`
  - `C:/Users/musta/Downloads/Uyanik Koc - Yonetim Paneli (1).html`
  - `C:/Users/musta/Downloads/uyanikkoc (20).zip`
  - `C:/Users/musta/Downloads/uyanikkoc (21).zip`
- Web app only: `apps/web`, shared web/server/database packages as needed.
- Mobile app is explicitly out of scope. Do not edit `apps/mobile` or mobile-only handoff content.
- Preserve the current public `uyanikkoc.com` experience unless a referenced web app screen requires shared styling.
- Use handoff/prototype files as the source of truth; do not invent unrelated screens.

## Working Rules

1. Work one stage at a time.
2. Before implementing each stage, compare prototype/handoff files with current repo files.
3. Implement only missing or outdated web screens and the backend/service/API surface required by those screens.
4. After each stage, run the smallest relevant tests first, then broader checks if needed.
5. Fix failures before moving to the next stage.
6. Keep changes scoped; avoid mobile, CRM, live AI, and unrelated refactors.

## Stages

### Stage 0 - Baseline And Inventory

- Expand or inspect the provided design archives.
- Build an inventory of prototype screens/modules.
- Map each prototype screen to the current Next.js route/component/service.
- Mark each item as implemented, partially implemented, missing, or out of scope.
- Output the comparison into this plan before moving to implementation.

### Stage 1 - Yonetim Access Shell

- Ensure `/yonetim` is the single management entry for Super Admin, Kurum, and Koc.
- Super Admin and Kurum get their existing role-based management screens.
- Koc gets only license/control management inside `/yonetim`.
- Student and Parent remain outside `/yonetim`.
- Validate with RBAC tests.

### Stage 2 - Admin/Kurum Prototype Parity

- Compare `uyanikkoc-admin` handoff components with current `apps/web/components/admin`.
- Apply only missing or outdated admin/branch screens.
- Add or adjust backend service/API behavior when a screen action has no current backend path.
- Validate with admin tests, typecheck, lint.

### Stage 3 - Dashboard Redesign Prototype Parity

- Compare dashboard redesign prototype modules from `uyanikkoc (20).zip` with current student/coach/parent/shared web screens.
- Exclude mobile-specific screens.
- Apply missing or outdated web screens one at a time.
- Add or adjust backend service/API behavior for each implemented screen.
- Validate with targeted tests per module.

#### Stage 3A - Yillik Konu Cizelge Backend

- Status: Complete.
- Added the topic study-session data contract used by the yearly grid.
- Exposed coach-only APIs for listing and upserting per-topic question/correct sessions for a selected student.
- Kept ownership checks through coach-student roster validation.
- Validation:
  - `pnpm --filter @uyanik/web test -- __tests__/topics.test.ts` passed.
  - `pnpm --filter @uyanik/database generate` passed after stopping the stale local `next start -p 3010` process that was locking Prisma's Windows DLL.
  - `pnpm --filter @uyanik/web typecheck` passed.
  - `pnpm --filter @uyanik/database typecheck` passed.

#### Stage 3B - Yillik Konu Cizelge UI

- Status: Complete.
- Added the reusable yearly topic grid component based on the handoff.
- Added a Liste/Cizelge switch inside the existing Coach Konu Takibi screen.
- Added the separate coach menu/page entry for Yillik Cizelge.
- Validation:
  - `pnpm --filter @uyanik/web test -- __tests__/topics.test.ts __tests__/icons.test.ts` passed.
  - `pnpm --filter @uyanik/web typecheck` passed.
  - `pnpm --filter @uyanik/web lint` passed.

### Stage 4 - Billing, Support, Messaging, Notifications, Tests, Exams

- Compare each prototype/handoff module to current app routes/APIs.
- Implement only gaps that are confirmed by Stage 0 inventory.
- Validate each module with targeted tests before moving on.

### Stage 5 - Final Verification

- Status: Complete for the current pass.
- Validation:
  - `pnpm --filter @uyanik/web typecheck` passed.
  - `pnpm --filter @uyanik/database typecheck` passed.
  - `pnpm --filter @uyanik/web lint` passed.
  - `pnpm --filter @uyanik/web test` passed: 16 files, 65 tests.
  - `pnpm --filter @uyanik/web build` passed.
- Known existing warnings:
  - Metronic assets are missing at `public/assets/metronic/`.
  - `package.json#prisma` config is deprecated for Prisma 7.
  - Next.js ESLint plugin is not detected in the current ESLint config.

## Stage 0 Inventory

| Module | Prototype/handoff source | Current route/component/API | Status | Notes |
|---|---|---|---|---|
| Yonetim access shell | `Uyanik Koc - Yonetim Paneli (1).html`, `handoff/uyanikkoc-admin` | `/yonetim/*`, `YonetimShell`, `YonetimRolePage`, RBAC helpers | Implemented in this workstream | `/yonetim` is now the shared management entry for super admin, kurum, and coach; coach sees only license/control surfaces. |
| Super Admin screens | `handoff/uyanikkoc-admin/components/admin/super/*` | `apps/web/components/admin/super/*`, `/yonetim/dashboard`, `/yonetim/orgs`, `/yonetim/licenses`, `/yonetim/coaches`, `/yonetim/revenue`, `/yonetim/modules`, `/yonetim/support`, `/yonetim/campaigns` | Implemented | Handoff component names are present; routes are consolidated under `/yonetim` instead of separate `/admin`. |
| Kurum/Branch screens | `handoff/uyanikkoc-admin/components/admin/branch/*` | `apps/web/components/admin/branch/*`, `/yonetim/dashboard`, `/yonetim/coaches`, `/yonetim/students`, `/yonetim/branches`, `/yonetim/license`, `/yonetim/revenue`, `/yonetim/reports`, `/yonetim/managers`, `/yonetim/settings` | Implemented | Handoff component names are present; routes are role-rendered under `/yonetim`. |
| Coach license/control in management | Admin prototype coach license panel | `/yonetim/dashboard`, `/yonetim/license`, `CoachLicensePanel` | Implemented in this workstream | Coach is restricted to management license/control pages. |
| Billing | `handoff/uyanikkoc-billing`, `src/billing*.jsx` | `/api/billing/*`, `BillingPanel`, checkout/card modals, DB repository/migration, shared billing tests | Implemented | Web UI + backend + shared pricing helpers present. |
| Support | `handoff/uyanikkoc-support`, `src/support.jsx` | `/api/support`, `/api/support/tickets`, `SupportPanel`, DB repository/migration | Implemented | Role-scoped support panel exists for student/parent/coach. |
| Coach ratings | `handoff/uyanikkoc-ratings`, `src/coach-rating.jsx` | `/api/student/coach-rating`, `/api/coach/ratings`, `CoachRatingCard`, `CoachRatingsSummary`, DB repository/migration | Implemented | Student rating and coach summary surfaces present. |
| Online deneme / optik | `handoff/uyanikkoc-online-exam`, `src/online-deneme.jsx` | `/api/coach/online-exams`, `/api/student/online-exams/*`, `OptikFormModal`, student exams panel, DB repository/migration, shared optik tests | Implemented | Coach create/list and student submit/review APIs exist. |
| Motivation send/latest | `handoff/uyanikkoc-remaining/01-motivation.ts.txt`, `src/motivation-send.jsx` | `/api/coach/motivation`, `/api/student/motivation/latest`, `MotivationSendModal`, `MotivationPanel`, DB repository/migration | Implemented | Broadcast + latest student message path present. |
| Parent reports | `handoff/uyanikkoc-remaining/02-reports.ts.txt`, `src/reports.jsx` | `/api/coach/reports`, `/api/coach/reports/[id]/approve`, `/api/parent/reports`, `CoachReportsPanel`, `ParentReportsPanel`, DB repository/migration | Implemented | Detail, approval, parent view, and notification flow present. |
| Messaging groups | `handoff/uyanikkoc-remaining/03-messaging-groups.ts.txt`, `src/messaging.jsx` | `/api/coach/groups`, `/api/coach/groups/[id]/members`, role message APIs, `MessagesPanel`, `GroupCreateModal`, DB repository/migration | Implemented | Group membership and role-scoped thread visibility are present. |
| Appointments | `handoff/uyanikkoc-remaining/04-appointments.ts.txt`, `src/appointments*.jsx` | `/api/coach/appointments`, `/api/student/appointments`, `/api/parent/appointments`, `AppointmentsPanel`, shared appointment helpers | Mostly implemented | Phone mode, slot modes, and student/parent weekly limits exist. Current service still uses the appointment memory store for web appointments; no DB appointment repository is present. |
| Tests builder | `handoff/uyanikkoc-remaining/05-tests-builder.ts.txt`, `src/tests-ui.jsx` | `/api/coach/tests`, `/api/student/tests`, `CoachTestsPanel`, `StudentTestsPanel`, `TestBuilderModal`, shared scoring tests, DB repository/migration | Implemented | Custom question kinds and builder are present. |
| Notifications/settings | `src/notifications.jsx`, settings prototype | `/api/*/notifications`, `NotificationBell`, `NotificationsPanel`, `NotificationSettingsPanel` | Implemented | Role-specific notification APIs and UI exist. |
| Kaynak/catalog/resources | `src/kaynak*.jsx`, `src/odev-student.jsx` | `/api/student/sources`, `StudentResourcesCard`, `KaynakKatalogModal`, assignment/source panels | Implemented | Student kaynak catalog and resource status UI present. |
| Deneme kayit/events/manual import | `src/deneme-kayit.jsx`, `src/deneme-import.jsx`, `src/manual-exam.jsx` | `/api/coach/deneme-events`, `/api/student/deneme-events`, `/api/student/deneme-membership`, coach/student exam panels | Implemented | Deneme event registration and exam entry surfaces present. |
| Yillik konu takip cizelgesi | `handoff/yillik-cizelge`, dashboard prototype `c-cizelge` | No `/coach/topics/annual` page; no `KonuCizelge` component; no persisted topic study-session backend | Missing | This is the first confirmed non-mobile screen gap to implement in Stage 3A/3B. |
| Mobile backend/app | `handoff/uyanikkoc-mobile`, `apps/mobile` | Existing mobile APIs and Expo app | Out of scope | User explicitly said to do nothing about mobile. |
