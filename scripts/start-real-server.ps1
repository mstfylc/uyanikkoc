# Uyanik — gercek sunucu (PostgreSQL + Next.js)
# Gereksinim: Docker Desktop acik

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "1/4 Postgres (docker compose)..." -ForegroundColor Cyan
docker compose -f docker-compose.dev.yml up -d
if ($LASTEXITCODE -ne 0) { throw "Docker/Postgres baslatilamadi. Docker Desktop acik mi?" }

Write-Host "2/4 Postgres hazir olana kadar bekleniyor..." -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  $result = docker exec uyanik-postgres-local pg_isready -U uyanik -d uyanik 2>$null
  if ($LASTEXITCODE -eq 0) { $ready = $true; break }
  Start-Sleep -Seconds 2
}
if (-not $ready) { throw "Postgres 60 saniyede hazir olmadi." }

Write-Host "3/4 Prisma migrate + seed..." -ForegroundColor Cyan
npx pnpm db:generate
npx pnpm db:migrate
npx pnpm db:seed

Write-Host "4/4 Next.js dev (http://localhost:3010)..." -ForegroundColor Cyan
Write-Host "Bellek modu KAPALI — DEMO_AUTH_ALLOW_IN_MEMORY=false (apps/web/.env.local)" -ForegroundColor Yellow
npx pnpm dev:web
