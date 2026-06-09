# Uyanikkoc 33 Design Apply Plan

Source package: `C:/Users/musta/Downloads/uyanikkoc (33).zip`

Extracted source: `.design-import/uyanikkoc-33/indir/Uyanik Koc - Giris Ekrani Yenileme v1`

## Rules For This Run

- Design source is the visual source of truth for the login screen.
- No mobile work.
- Preserve production auth/security behavior from the live app.
- Remove the visible "Demo bilgileriyle doldur" button as requested by the source package.
- Compare source vs applied code and report integration differences.

## Source Inventory

- `src/auth.jsx`: login left-art markup, glass preview cards, refreshed logo lockup, demo-fill button removed.
- `src/styles.css`: updated `/* ---- auth / login ---- */` block.

## Phase 1 - Login Screen

Target files:
- `apps/web/components/auth/LoginForm.tsx`
- `apps/web/styles/uk-design.css`

Applied:
- Login left panel now has source-style layered product preview cards:
  - net growth sparkline and `+53`
  - `74%` topic completion ring
  - `12 gun seri` chip
- Login logo lockup now uses the source `auth-brand` / `auth-logo` structure.
- Auth CSS block was expanded to include the source `auth-art`, `auth-stage`, `auth-pcard`, `ap-*`, `auth-foot`, and animation rules.
- The visible `Demo bilgileriyle doldur` button was removed.

Intentional integration differences:
- `LoginForm.tsx` keeps NextAuth/Auth.js credential login instead of the prototype's localStorage demo auth.
- `/yonetim` role hint and production demo security behavior are retained.
- Development role selector remains for `student/coach/parent/admin/branch` because the app needs admin/branch demo paths during local QA; production still hides it.
- Form remains email/password only because the current backend login provider is email-based; the prototype's phone login is not wired to a backend in this package.
- Text is ASCII-normalized to match the current app's encoding style.

Skipped:
- No mobile files.
- No backend migration needed; package is visual login-only.

Verification:
- `pnpm --filter @uyanik/web typecheck` PASS
- `pnpm --filter @uyanik/web lint` PASS
- `pnpm --filter @uyanik/web test -- __tests__/demo-auth.test.ts __tests__/env.test.ts __tests__/icons.test.ts` PASS
- `pnpm --filter @uyanik/web build` PASS with local verification secrets (`AUTH_SECRET` and `NEXTAUTH_SECRET`)
- Local Playwright smoke PASS:
  - `.auth-brand` exists
  - `.auth-stage` exists
  - 3 `.auth-pcard` preview cards exist
  - `.ap-spark .spark` exists
  - "Demo bilgileriyle doldur" button count is 0
  - demo student login still reaches `/student/dashboard`
- `pnpm --filter @uyanik/web test:e2e` PASS, 12/12
- `pnpm test:unit` PASS

Deployment:
- Commit: `4111362 apply uyanikkoc 33 login design`
- Production deploy: `https://uyanikkoc-87q746k1v-uyanik.vercel.app`
- Aliases verified:
  - `https://www.uyanikkoc.com`
  - `https://uyanikkoc.com`
  - `https://koc.uyanik.com.tr`
- Live login smoke PASS:
  - `.auth-brand` exists
  - `.auth-stage` exists
  - 3 `.auth-pcard` preview cards exist
  - `.ap-spark .spark` exists
  - "Demo bilgileriyle doldur" button count is 0
- Live auth/security smoke PASS:
  - production demo user login rejected
  - anonymous `/api/admin/snapshot` returns 401
  - real superadmin login reaches `/yonetim/dashboard`
