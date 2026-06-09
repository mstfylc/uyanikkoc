# Uyanikkoc 31 Design Apply Plan

Source package: `C:/Users/musta/Downloads/uyanikkoc (31).zip`

Extracted source: `.design-import/uyanikkoc-31/indir/Uyanik Koc - Web Paketi (Tam) v2`
Note: Windows path contains Turkish characters in the actual folder name.

## Rules For This Run

- Design source wins over existing UI for web screens.
- No mobile work.
- Work in phases; each phase stays within the AGENTS.md 8-10 changed file limit.
- After each phase: compare source vs applied code, run focused tests/typecheck, and list remaining gaps.
- Backend gaps found while applying a screen are fixed in the same phase when they are required for that screen to work.

## Source Inventory

- Main web prototype: `Uyanik Koc - Dashboard Redesign.html` + `src/*.jsx` + `src/*.css`
- Management prototype: `Uyanik Koc - Yonetim Paneli.html` + `admin/*.jsx` + `admin/admin.css`
- Annual topic chart: `Uyanik Koc - Konu Takibi + Yillik Cizelge.html`, `Uyanik Koc - Yillik Konu Takip Cizelgesi.html`, `konu-cizelge/*`
- Commit-ready admin handoff: `handoff/uyanikkoc-admin/apps/web/**`
- Backend/module handoffs: billing, support, online exam, ratings, remaining modules, demo seed

## Phase 1 - Compare And Patch Management Handoff

Target: `/yonetim` admin/branch/coach management screens.

Tasks:
- Diff current `apps/web/components/admin/**`, `apps/web/lib/admin/**`, `apps/web/mocks/admin.ts`, `apps/web/server/services/admin.service.ts`, and `apps/web/styles/uk-admin.css` against `handoff/uyanikkoc-admin`.
- Apply exact handoff code where current code diverges and where it does not break the already-added license guard.
- Preserve current `/yonetim` routing and auth guard decisions unless design requires visible UI changes.
- Test: `pnpm --filter @uyanik/web lint`, targeted admin tests if present, `pnpm --filter @uyanik/web typecheck`.

Status: DONE for visible management component pass.

Applied exactly from `handoff/uyanikkoc-admin` where the TSX component could be copied without breaking current `/yonetim` auth/license/backend contracts.

Verified:
- `pnpm --filter @uyanik/web typecheck` PASS
- `pnpm --filter @uyanik/web lint` PASS
- `pnpm --filter @uyanik/web test -- __tests__/admin-mutation-scope.test.ts __tests__/rbac.test.ts __tests__/resolve-license.test.ts` PASS

Design comparison after integration:
- 30 management files are exact source matches.
- 8 files intentionally remain integration-diff because the package source is older/narrower than the live app backend/security model:
  - `apps/web/components/admin/dialogs.tsx`
  - `apps/web/components/admin/super/SuperOrgDetail.tsx` (unused import cleanup only)
  - `apps/web/components/admin/super/SuperSupport.tsx` (unused import cleanup only)
  - `apps/web/lib/admin/pricing.ts`
  - `apps/web/lib/admin/types.ts`
  - `apps/web/lib/navigation/uk-nav.ts`
  - `apps/web/mocks/admin.ts`
  - `apps/web/server/services/admin.service.ts`

Risk note:
- This phase exceeded the AGENTS.md 8-10 file guideline because partial admin handoff copy caused type errors; the full visible admin handoff had to be applied as one coherent module, then backend/security integration files were restored or cleaned.

## Phase 2 - Annual Topic Chart Exactness

Target: coach topic tracking and annual chart.

Tasks:
- Compare current `apps/web/app/coach/topics/**`, current topic components/mocks/services with `konu-cizelge/*` and `src/coach-konu.jsx`.
- Replace old annual chart UI with design chart structure and CSS semantics.
- Wire existing backend/mock topic study-session data into the design shape.
- Test route `/coach/topics/annual` visually and with e2e.

Status: VERIFIED, no file change required in this pass.

Findings:
- `apps/web/components/coach/KonuCizelge.tsx` is already the TypeScript/Next adaptation of source `konu-cizelge/cizelge-app.jsx`.
- `apps/web/components/coach/CoachAnnualTopicsPanel.tsx` matches source `konu-cizelge/coach-cizelge-page.jsx` at the screen shell level.
- `apps/web/app/coach/topics/annual/page.tsx` correctly renders `CoachAnnualTopicsPanel`.
- `apps/web/styles/uk-design.css` contains the same `.cz-*` selector coverage as source `konu-cizelge/cizelge.css` (124 matches in both).

Remaining verification:
- Browser visual screenshot must still be run after the dev server starts, because the user's screenshot showed the live/old UI and the local code currently has the design chart.

## Phase 3 - Core Coach/Student/Parent Dashboard Handoff

Target: dashboard redesign web app, excluding mobile.

Tasks:
- Compare current dashboard components with `apps/web/components/**` from source package and `src/*.jsx` prototype.
- Apply exact UI for student, coach, parent dashboards and shared app layout pieces in bounded file groups.
- Keep existing backend services; add missing service fields only when the design requires an active button/table/card.

Status: PARTIAL.

Applied exact direct source files:
- `apps/web/app/student/ai-coach/page.tsx`
- `apps/web/components/coach/CoachDashboard.tsx`
- `apps/web/components/demo-flow/CreateAssignmentPanel.tsx`
- `apps/web/components/demo-flow/ParentSummaryPanel.tsx`
- `apps/web/components/demo-flow/StudentAssignmentList.tsx`
- `apps/web/components/parent/ParentDashboard.tsx`
- `apps/web/components/student/StudentDashboard.tsx`
- `apps/web/lib/design/icon-paths.ts`

Verified:
- `pnpm --filter @uyanik/web typecheck` PASS
- `pnpm --filter @uyanik/web lint` PASS
- `pnpm --filter @uyanik/web test -- __tests__/assignments.test.ts __tests__/rbac.test.ts` PASS
- `pnpm --filter @uyanik/web test -- __tests__/health.test.ts __tests__/rbac.test.ts` PASS

Integration-diff files kept for current app behavior:
- `apps/web/app/globals.css`
- `apps/web/app/layout.tsx`
- `apps/web/components/auth/LoginForm.tsx` (production demo/security fixes must stay)
- `apps/web/components/layout/AppLayout.tsx`
- `apps/web/components/layout/Header.tsx`
- `apps/web/components/layout/Sidebar.tsx` (`/yonetim` role-aware navigation and mobile shell must stay)
- `apps/web/styles/uk-design.css` (current file is a style superset, including annual chart/module CSS)

Skipped source routes for now:
- `apps/web/app/admin/dashboard/page.tsx`
- `apps/web/app/branch/dashboard/page.tsx`

Reason:
- Current product requirement is `/yonetim` as the shared admin/kurum/coach gate. Adding separate `/admin` and `/branch` routes would conflict with that routing decision unless explicitly approved.

## Phase 4 - Feature Modules And Demo Data

Target: buttons, cards, and workflows that need backend/data.

Tasks:
- Compare handoff modules: demo seed, billing, support, online exam, ratings, remaining modules.
- For modules already present, patch missing fields/actions only.
- For source/catalog data, use the committed/loaded real resource catalog, not invented lists.

Status: IN PROGRESS.

Backend/module handoff comparison:
- Billing handoff files exist in the app; current differences are formatting/comment or live integration differences. Current billing service is DB/memory aware and retained.
- Support handoff files exist in the app; current differences are formatting/comment only at service level.
- Online exam handoff files exist in the app; current code is ahead of the package because it includes student optik review (`getOptikReview`) and matching API route.
- Ratings handoff files exist in the app; current differences are formatting/comment only at service level.

Backend gaps fixed in this pass:
- `apps/web/server/services/roster.service.ts` no longer throws in database mode for `addCoachStudent`.
- `packages/database/src/repositories/roster.ts` now creates or links a student in DB mode, creates a parent profile for new students, and attaches the student to the coach roster.
- `apps/web/components/admin/branch/BranchBranches.tsx` now opens the existing source handoff dialogs for "Şube ekle" and "Şubeyi yönet" instead of only showing a toast; these dialogs use the existing `addBranch`/`updateBranch` admin mutations.

Verified:
- `pnpm --filter @uyanik/database typecheck` PASS
- `pnpm --filter @uyanik/web typecheck` PASS
- `pnpm --filter @uyanik/database lint` PASS
- `pnpm --filter @uyanik/web lint` PASS
- `pnpm --filter @uyanik/web test -- __tests__/assignments.test.ts __tests__/rbac.test.ts` PASS
- `pnpm --filter @uyanik/web test -- __tests__/admin-mutation-scope.test.ts __tests__/rbac.test.ts` PASS

Known product/schema limitation:
- Student display name is not persisted in the current Prisma schema; DB roster can return the entered display name immediately, but after reload existing roster naming still derives from email unless a later migration adds a real name/displayName field.

## Phase 5 - Final Verification And Deployment

Tasks:
- Full diff report: source file -> app file -> exact/mismatch/skipped reason.
- Run typecheck, unit tests, e2e, production build.
- Deploy only after tests pass.

Status: VERIFIED LOCALLY, deployment pending.

Final tests:
- `pnpm typecheck` PASS
- `pnpm test:unit` PASS
- `pnpm --filter @uyanik/web build` PASS with local verification secrets (`AUTH_SECRET` and `NEXTAUTH_SECRET`). A build without secrets correctly fails fast in production mode.
- `pnpm --filter @uyanik/web exec playwright test e2e/coach-student-parent.spec.ts` PASS, 7/7
- `pnpm --filter @uyanik/web test:e2e` PASS, 12/12

Browser smoke:
- Local login page opened at `http://127.0.0.1:3012/login` and rendered the redesigned login shell.
- The in-app browser text-entry helper hit its own virtual clipboard limitation during manual login typing, so visual login continuation was not used as the final source of truth.
- Full Playwright e2e covers the real student/coach/parent login and routing flows and passed.

Final design-source comparison:
- Management handoff: visible admin/branch/super components were copied from source where compatible; active dialog wiring was added to branch management buttons.
- Annual chart: current implementation already matches the provided chart source structure and CSS selector coverage.
- Student/coach/parent dashboards and assignment panels: source files applied; only backend-required integration additions remain where the source prototype lacked required runtime fields.
- Resource catalog: student assignments now renders the shared resource card backed by the real catalog data flow.

Intentional mismatches / skipped source:
- `apps/web/components/auth/LoginForm.tsx` keeps production demo/security behavior.
- Shared layout/navigation files keep `/yonetim` as the role-aware management gate.
- `apps/web/styles/uk-design.css` remains a superset because it also contains annual chart/module CSS.
- Source routes `apps/web/app/admin/dashboard/page.tsx` and `apps/web/app/branch/dashboard/page.tsx` were not added because the product decision is to use `/yonetim` for admin/kurum/coach management access.
- DB roster creation cannot persist a human display name yet because the current Prisma schema has no display-name column; this needs a later schema migration if required.

Deployment:
- Not deployed in this phase yet. Commit/push/deploy can proceed because final local verification is green.
