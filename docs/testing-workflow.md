# SmartBitz Testing Workflow

## 1) Current test layout

- API tests live under `apps/api/test`.
- HTTP e2e tests are under `apps/api/test/http`.
- Integration validations are under `apps/api/test/integration`.
- Shared lifecycle setup is in `apps/api/test/setup.ts`.

## 2) Known weaknesses addressed

- Duplicate test data setup across e2e specs.
- Repeated role/permission seeding logic.
- Ad-hoc JWT generation in tests.

## 3) Shared test utilities

Use helpers under `apps/api/test/helpers`:

- `factories.ts`
  - `createTenant(prisma, name?)`
  - `seedRoleWithPermissions(prisma, { tenantId, roleName, permissions })`
- `jwt.ts`
  - `signTestJwt({ userId, email, role, tenantId?, membershipId? })`

Guideline: prefer helpers for repeated setup logic before adding new one-off setup blocks in test files.

## 4) PostgreSQL test baseline (Phase 1)

The test bootstrap now requires PostgreSQL and performs deterministic reset using Prisma schema push.

Environment variables:

- `TEST_DATABASE_URL` (preferred for tests)
- fallback: `DATABASE_URL`

Example:

```bash
export TEST_DATABASE_URL="postgresql://smartbitz:smartbitz@localhost:5432/smartbitz_test?schema=public"
```

Setup behavior in `test/setup.ts`:
- validates PostgreSQL URL
- waits for PostgreSQL readiness
- runs `prisma db push --force-reset --skip-generate`
- truncates tenant module tables before each test

## 5) Required test types for new modules

### Tenant-scoped module
- Authenticated happy path test.
- Permission denial test (missing permission).
- Cross-tenant denial test.
- Missing tenant context rejection test.

### Platform-admin module
- `platform_admin` allow test.
- Non-platform role deny test.

### Stats/dashboard endpoint
- Response shape test.
- Tenant scoping test (no cross-tenant leakage).

## 6) Test writing standards

- Keep tests deterministic and isolated.
- Reuse `setup.ts` database lifecycle.
- Avoid shelling out unless validating integration scripts.
- Prefer small explicit assertions over broad snapshots.

## 7) Suggested command sequence

- Start local infrastructure (from repo root):
  - `docker compose up -d postgres redis`
- Typecheck/lint:
  - `npm --prefix apps/api run lint`
- Focused e2e during development:
  - `npm --prefix apps/api run test:e2e -- --runInBand test/http/<spec>.ts`
- Critical Phase 1 e2e checks:
  - `npm --prefix apps/api run test:e2e:critical`
- Broader suite before merge:
  - `npm --prefix apps/api run test:e2e`
