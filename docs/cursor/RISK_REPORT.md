# Risk Report

Status: OPEN - non-design mail delivery configuration required.

- Claude Design web parity blocker: none.
- 2026-06-13 reality parity delta: `/coach/topics` source-backed fixes and browser QA passed locally; no new design was produced.
- `CODEX_P12_COACH_TOPICS_PIXEL_PARITY_PROMPT.md` file was not present in Downloads/repo search paths; its coach-topics acceptance criteria were covered by the final audit prompt, no-new-design addendum, and canonical `coach-konu.jsx/css`.
- No-new-design compliance: no source-absent component, color, spacing, flow, text, visual decision, or fake data was added.
- Live V6 deploy, health, role smoke, `/coach/topics` visual QA, SmartOdev, optik ingestion, messages, and notifications smoke passed.
- Final all-areas visual QA: 37 live Playwright checks passed, 0 failed.
- Coach notifications parity gap is closed by `/coach/notifications` shared guarded panel.
- Remaining risk: production password reset email delivery is not active because `RESEND_API_KEY` is present but empty in production env.
- Required fix: add a real Resend API key in the production secret store, keep `MAIL_FROM` valid, redeploy, and send a password reset request smoke test.
- No code, DB migration, or schema change is required for this risk.
