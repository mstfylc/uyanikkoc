# Handoff 25 Completion Plan

Source package: `C:/Users/musta/Downloads/uyanikkoc (25).zip`

Scope:
- Web app and management screens only.
- Mobile app is out of scope.
- CRM, live AI, and unrelated public landing changes are out of scope.

Working rule:
- Audit one area, implement missing UI/backend, run targeted tests, then move to the next area.

## Current Pass

### 1. Kaynak Takibi / Odev Harici Calisma

Status: Complete in this pass.

Handoff source:
- `src/kaynak-tracker.jsx`
- `src/kaynak-tracker.css`
- `src/odev-store.jsx`
- `src/coach-pages.jsx`
- `src/parent.jsx`

Current repo finding:
- Student source catalog add/remove exists.
- Missing handoff behavior:
  - source status: `beklemede` / `aktif` / `bitti`
  - manual progress percentage per source
  - self-study entries from source rows: `Cozdum` and `Calistim`
  - source activity summary including self-study question count and latest activity
  - coach read/write source tracking view for selected student
  - parent read-only source tracking view

Implemented:
- Extended the student sources mock/service/API without breaking the existing `sources: string[]` contract.
- Added `tracker.items`, `tracker.selfStudy`, and source activity payloads.
- Added source status/progress update and self-study create/delete actions.
- Replaced the student source chip list with a tracker matching the handoff controls.
- Reused the tracker in coach assignments for selected students.
- Added parent read-only tracker through `/api/parent/sources`.
- Added focused tests for source item update and self-study actions.

Validation:
- `pnpm --filter @uyanik/web test -- student-sources.test.ts` passed.
- `pnpm --filter @uyanik/web typecheck` passed.
- `pnpm --filter @uyanik/web lint` passed.
- Broader unit/build checks still required before deploy.

## Backlog From This Audit

- Continue area-by-area comparison after Kaynak Takibi is complete:
  - assignments result entry and source linkage
  - coach assignment source tracker section
  - parent read-only progress widgets
  - dashboard buttons/actions from `src/student-pages.jsx`, `src/coach-pages.jsx`, and admin handoff components
