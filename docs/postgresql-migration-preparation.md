# PostgreSQL Migration Preparation

This project currently uses SQLite in development/test (`DATABASE_URL` in `.env.example` and Prisma schema datasource), while product targets PostgreSQL + Redis.

## Current compatibility checks
- IDs use `cuid()` and are database-portable.
- Relations use explicit foreign keys with clear `onDelete` rules.
- Tenant-critical uniqueness constraints already exist:
  - `Invoice @@unique([tenantId, number])`
  - `TenantMembership @@unique([userId, tenantId])`

## Pre-migration checklist
1. Keep Prisma schema relation model as-is (already portable to PostgreSQL).
2. Remove SQLite-only assumptions from scripts and docs.
3. Ensure production environment validation requires PostgreSQL DSN.
4. Add supporting indexes for high-volume tenant queries before cutover:
   - `Customer(tenantId)`
   - `InventoryItem(tenantId, isActive)`
   - `Invoice(tenantId, status)`
   - `Purchase(tenantId, status)`
   - `SupportTicket(tenantId, status)`
5. Validate migration replay in a clean PostgreSQL database.

## Suggested migration runbook
1. Add a PostgreSQL environment file (`DATABASE_URL=postgresql://...`).
2. Run `pnpm --filter @smartbitz/api prisma:generate`.
3. Run `pnpm --filter @smartbitz/api prisma:migrate dev` in a staging DB.
4. Run API test suite against PostgreSQL DSN.
5. Execute tenant isolation and permissions e2e tests.
6. Promote migrations to production with `prisma migrate deploy`.

## Risks to monitor
- Behavior changes in text search (`contains`) between SQLite and PostgreSQL collations.
- Decimal/float precision on monetary fields currently modeled as `Float`.
- Data volume/performance assumptions for dashboards without pagination.
