# Latest Handoff

**Son tamamlanan faz:** PROMPT 11 — CI kalite kapisi  
**Commits:** `ci: add basic quality gate`  
**Branch:** main  

## Durum

- `.github/workflows/ci.yml`: install, db:generate, typecheck, lint, test:unit
- External secret yok; dummy DATABASE_URL + DEMO_AUTH_ALLOW_IN_MEMORY=true
- E2E CI disinda (manuel / ayri job icin hazir)
- Test: typecheck ✓ lint ✓ unit 28 ✓

## Sonraki faz

**PROMPT 12** — Deploy karari dokumantasyonu (onay bekleniyor)

## Not

Push sonrasi GitHub Actions otomatik calisir.
