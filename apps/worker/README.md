# @uyanik/worker

Minimal job runner skeleton for Uyanik Koc background tasks.

## Scripts

- `pnpm --filter @uyanik/worker typecheck` — TypeScript check
- `pnpm --filter @uyanik/worker dev` — runs stub `assignment-reminder` job (log only)

## Jobs

| Job | Status |
|-----|--------|
| `assignment-reminder` | Stub — logs only, no Redis/BullMQ |

Production queue integration is deferred.
