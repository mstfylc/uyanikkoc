# Load test harness

Optional k6 scripts for staging capacity checks. They are not part of the normal CI gate and should not be run against production traffic unless an explicit maintenance window is approved.

## Commands

```bash
k6 run -e BASE_URL=https://staging.example.com scripts/load/health.js
k6 run -e BASE_URL=https://staging.example.com -e DEMO_STUDENT_EMAIL=student@example.com -e DEMO_STUDENT_PASSWORD=*** scripts/load/auth-login.js
k6 run -e BASE_URL=https://staging.example.com -e DEMO_STUDENT_EMAIL=student@example.com -e DEMO_STUDENT_PASSWORD=*** scripts/load/student-read.js
```

Use `VUS` and `DURATION` to tune the load, for example `-e VUS=50 -e DURATION=3m`.

Production protection: scripts refuse domains matching `uyanikkoc.com` or `uyanik.com.tr` unless `ALLOW_PROD_LOAD=true` is provided intentionally.
