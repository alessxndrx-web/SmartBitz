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

## 4) Required test types for new modules

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

## 5) Test writing standards

- Keep tests deterministic and isolated.
- Reuse `setup.ts` database lifecycle.
- Avoid shelling out unless validating integration scripts.
- Prefer small explicit assertions over broad snapshots.

## 6) Suggested command sequence

- Typecheck/lint:
  - `npm --prefix apps/api run lint`
- Focused e2e during development:
  - `npm --prefix apps/api run test:e2e -- --runInBand test/http/<spec>.ts`
- Broader suite before merge:
  - `npm --prefix apps/api run test:e2e`
