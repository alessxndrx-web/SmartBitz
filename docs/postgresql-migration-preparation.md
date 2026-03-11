# PostgreSQL Migration Strategy (Phase 1 Infrastructure)

SmartBitz now targets PostgreSQL as the primary datasource in Prisma schema.

## Why this strategy
Existing historical Prisma SQL migrations were generated for SQLite syntax (`DATETIME`, etc.).
Applying those files directly with `prisma migrate deploy` on PostgreSQL is risky and can fail.

To keep Phase 1 safe and unblock infrastructure work, we use a **two-step strategy**:

1. **Schema-first reset for test/staging validation**
   - Use `prisma db push --force-reset` against PostgreSQL in automated tests.
   - This validates model compatibility and query behavior now.

2. **PostgreSQL migration baseline before production cutover**
   - Create a clean PostgreSQL baseline migration from current schema.
   - Mark/retire legacy SQLite migration history in a controlled rollout.
   - From that point forward, use `prisma migrate deploy` only with PostgreSQL-native migration files.

## Execution plan
1. Configure `DATABASE_URL` with PostgreSQL DSN in all environments.
2. Run Prisma client generation with the PostgreSQL provider.
3. Run API tests against PostgreSQL (test setup now enforces PostgreSQL URL and resets schema via `db push`).
4. Validate tenant isolation and RBAC suites on PostgreSQL.
5. Create and validate PostgreSQL baseline migration in staging.
6. Ship production cutover with backup + rollback window.

## Risk controls
- Keep backup snapshot before any production migration.
- Rehearse rollback to pre-cutover DB state.
- Monitor query latency and index usage after cutover.
- Pay special attention to money precision fields currently modeled as `Float`.

## Follow-up actions (post Phase 1)
- Convert monetary fields from `Float` to `Decimal` where appropriate.
- Add migration lint/check in CI to reject provider-incompatible SQL.
- Add staging smoke tests for migration + seed + e2e as release gate.
