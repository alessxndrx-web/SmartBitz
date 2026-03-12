# Local Infrastructure Workflow (Phase 1)

This document defines the reproducible local infrastructure path for PostgreSQL + Redis.

## Prerequisites
- Docker with Compose v2 (`docker compose`)
- Node.js / npm

## 1) Start local infrastructure
From repository root:

```bash
npm run infra:up
```

Check status:

```bash
docker compose ps
# or
npm run infra:logs
```

Stop infrastructure:

```bash
npm run infra:down
```

## 2) API environment
Recommended `.env` values for local runtime:

```env
DATABASE_URL="postgresql://smartbitz:smartbitz@localhost:5432/smartbitz"
REDIS_ENABLED="false"
REDIS_URL="redis://localhost:6379"
REDIS_QUEUE_PREFIX="smartbitz"
JWT_SECRET="change_me_in_production"
```

Notes:
- `REDIS_ENABLED=false` keeps startup safe when Redis/BullMQ dependencies are not installed yet.
- Enable Redis later by setting `REDIS_ENABLED=true` once dependencies are installed.

## 3) Prisma and API boot

```bash
cd apps/api
npx prisma generate
npx prisma db push
npm run dev
```

## 4) Tests against PostgreSQL

```bash
cd apps/api
export TEST_DATABASE_URL="postgresql://smartbitz:smartbitz@localhost:5432/smartbitz_test?schema=public"
npm run test:e2e
```

Critical suite used for Phase 1 validation:

```bash
npm run test:e2e:critical
```

Test bootstrap behavior:
- Enforces PostgreSQL URL.
- Waits for database availability.
- Resets schema via `prisma db push --force-reset --skip-generate` for deterministic runs.

## 5) Worker process

```bash
cd apps/api
npm run worker
```

Current behavior:
- Worker is safe to boot even when Redis/BullMQ dependencies are absent.
- Queue processing remains inactive until dependencies are installed and Redis is enabled.
