# SmartBitz Engineering Workflow

This document defines the practical workflow for safe, incremental development in SmartBitz.

## 1) Core architecture and boundaries

- Monorepo layout:
  - `apps/api`: NestJS backend (auth, RBAC, tenant modules, platform admin APIs)
  - `apps/web`: Next.js frontend (marketing + tenant dashboard + admin surface)
  - `packages/ui`: shared UI primitives
- Two product worlds must remain separated:
  - **Platform admin** (global operations, tenant lifecycle, plans, subscriptions)
  - **Tenant app** (customers, inventory, invoices, purchases, support, files, etc.)

## 2) Multi-tenant and RBAC rules (non-negotiable)

- Tenant authorization is membership-driven:
  - `TenantMembership.userId + tenantId + role`
- JWT context for tenant scope must include:
  - `userId`, `tenantId`, `membershipId`, `role`
- Tenant modules must never read/write without tenant scoping.
- Platform and tenant permissions must not be mixed in role grants.

## 3) Guard and controller rules

### Tenant-scoped endpoints
Use this guard stack in controllers:
1. `JwtAuthGuard`
2. `TenantGuard`
3. `PermissionsGuard`

### Platform endpoints
Use:
1. `JwtAuthGuard`
2. `RoleGuard`
3. `@Roles('platform_admin')`

## 4) Service-layer safety patterns

- Every tenant-scoped query must include `tenantId` (directly or via relation).
- For updates/deletes in tenant modules:
  - validate ownership first, then use tenant-safe mutation (`updateMany`/`deleteMany` or equivalent scoped condition).
- Never trust route IDs alone for authorization.
- Validate related entities belong to the same tenant before mutation.

## 5) DTO and validation standards

- Use explicit DTO classes for create/update/query.
- Avoid `any` in controller/service boundaries.
- Validate enums, optional fields, and date formats in DTOs.
- Keep response shape stable and documented for frontend integration.

## 6) Adding a new module (required flow)

1. Define routes and module boundary (tenant or platform).
2. Add DTOs with class-validator.
3. Apply guards in controller based on scope.
4. Implement tenant-safe service queries and mutations.
5. Register permissions and update role initialization logic.
6. Add tests:
   - auth/permission pass cases
   - cross-tenant denial
   - missing tenant context denial
7. Add docs updates if architecture or contracts changed.

## 7) Definition of done (DoD)

A backend/frontend task is done only when applicable checks pass:

- [ ] Correct guards applied for endpoint scope.
- [ ] Tenant scoping enforced for all reads/writes.
- [ ] DTO validation added/updated.
- [ ] RBAC permissions updated for new/changed routes.
- [ ] No legacy auth fallback introduced.
- [ ] No platform/tenant boundary mixing.
- [ ] Automated tests added/updated and passing.
- [ ] Docs updated for architecture/workflow/API changes.

## 8) Required delivery structure for future tasks

Every implementation summary should follow:
1. Analysis
2. Problems found
3. Implementation plan
4. Code changes made
5. Files modified
6. Validation steps
7. Risks / follow-ups

This is mandatory for AI-assisted and human-led contributions.
