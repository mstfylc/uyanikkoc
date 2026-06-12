# Risk Report

Status: OPEN - non-design mail delivery configuration required.

- Claude Design web parity blocker: none.
- Live V6 deploy, health, role smoke, `/coach/topics` visual QA, SmartOdev, optik ingestion, messages, and notifications smoke passed.
- Final all-areas visual QA: 37 live Playwright checks passed, 0 failed.
- Coach notifications parity gap is closed by `/coach/notifications` shared guarded panel.
- Remaining risk: production password reset email delivery is not active because `RESEND_API_KEY` is present but empty in production env.
- Required fix: add a real Resend API key in the production secret store, keep `MAIL_FROM` valid, redeploy, and send a password reset request smoke test.
- No code, DB migration, or schema change is required for this risk.
