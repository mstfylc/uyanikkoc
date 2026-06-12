# Risk Report

Status: OPEN - mail delivery configuration required.

- Live V6 deploy, health, role smoke, `/coach/topics` visual QA, SmartOdev, optik ingestion, messages, and notifications smoke passed.
- Remaining risk: production password reset email delivery is not active because `RESEND_API_KEY` is present but empty in production env.
- Required fix: add a real Resend API key in the production secret store, keep `MAIL_FROM` valid, redeploy, and send a password reset request smoke test.
- No code, DB migration, or schema change is required for this risk.
