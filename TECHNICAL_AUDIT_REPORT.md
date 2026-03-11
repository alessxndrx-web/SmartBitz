# SmartBitz Technical Audit Report

## 1. PROJECT OVERVIEW
- SmartBitz is positioned as a multi-tenant SaaS for SMB operations in Nicaragua/LATAM, covering accounting-adjacent operations, invoicing, customer management, inventory, and vertical modules by industry.
- Architecture target is monorepo + Next.js frontend + NestJS backend + Prisma ORM; README says PostgreSQL/Redis target, but current Prisma datasource is SQLite in code.
- Backend and frontend are separated under `apps/api` and `apps/web`, with shared UI package under `packages/ui`.
- Product has two conceptual worlds: public marketing + tenant app, and a platform-admin world.
- Public pages exist (`/`, `/pricing`, `/login`) and private dashboard routes exist under `/dashboard/*`.
- Platform admin is represented in backend (`/platform-admin/overview`) and a minimal frontend placeholder route (`/admin`).

## 2. REPOSITORY STRUCTURE
- `apps/api`: NestJS API (auth, tenant/business modules, guards, Prisma schema/migrations, tests).
- `apps/web`: Next.js App Router web app (marketing + dashboard UI).
- `packages/ui`: shared UI primitives package (`Button`, `Card`) currently minimal and mostly placeholder build/lint scripts.
- Root uses pnpm workspace + Turborepo for orchestration.

## 3. CURRENT BACKEND ARCHITECTURE
- App-level modules loaded in `AppModule`: tenants, auth, customers, invoices, inventory, purchases, roles, audit, support, files, health, platform-admin.
- Security middleware/global setup: helmet, CORS localhost:3000, global `/api` prefix, global validation pipe, throttler guard, global audit interceptor, global exception filter.
- Auth module provides register/login/me with JWT and role/membership payload.
- Business modules are mostly CRUD/services with tenantId parameter injection from JWT (`@TenantId()`), often guarded by JWT + PermissionsGuard (and in key modules, TenantGuard too).
- Roles module centralizes role/permission entities and permission-check logic.
- Platform admin module exposes aggregate overview metrics endpoint.

## 4. MULTI-TENANT ARCHITECTURE
- Data model includes `Tenant`, `User` (still carries `tenantId` + `role`), and `TenantMembership` (`userId`, `tenantId`, `role`, `createdAt`, unique user-tenant).
- Most domain models are tenant-scoped via explicit `tenantId` and relations to Tenant.
- Isolation pattern in services generally uses `findFirst({ where: { id, tenantId }})`, and updates/deletes are often done via `updateMany/deleteMany` with tenant filter.
- Membership abstraction exists, but legacy user-level tenant/role columns remain and are used as fallback in auth/roles logic.
- Guard-level tenant enforcement is partial: `TenantGuard` exists and checks `request.user.tenantId`, but not applied consistently on every module.

## 5. AUTHENTICATION SYSTEM
- Register flow:
  - tenant lookup by `tenantSlug`;
  - user creation with hashed password;
  - tenantMembership creation;
  - role bootstrap via `ensureTenantRoleExists` for non-platform-admin;
  - JWT issued with `sub`, `userId`, `email`, `tenantId`, `membershipId`, `role`.
- Login flow:
  - validates credentials;
  - loads first membership (`findFirst` ordered by createdAt asc);
  - if no membership, uses legacy fallback from `User.tenantId/User.role` and synthetic membership id;
  - computes permissions and embeds them in token.
- JWT strategy validates token and returns `userId`, `email`, `tenantId`, `membershipId`, `role` to request context.
- JWT secret handling: production requires explicit `JWT_SECRET`; non-production falls back to `dev-jwt-secret`.

## 6. AUTHORIZATION SYSTEM
- Role taxonomy in DTO is normalized to:
  - platform role: `platform_admin`
  - tenant roles: `tenant_owner`, `tenant_admin`, `staff`
- Guards present:
  - `JwtAuthGuard` (passport-jwt)
  - `TenantGuard` (ensures user and tenantId exist in JWT context)
  - `RoleGuard` (checks `@Roles(...)` metadata)
  - `PlatformAdminGuard` (strict role equality, but currently platform controller uses RoleGuard+@Roles instead)
  - `PermissionsGuard` (checks `@Permissions(module:action)` by querying RolesService)
- Permissions are tenant-specific rows linked via RolePermission.
- Permission model is robust conceptually, but default initialization list doesn’t include modules like `payments/files/support/tenants`, causing potential authorization gaps.

## 7. PLATFORM ADMIN MODULE
- Route: `GET /api/platform-admin/overview`.
- Guards: JWT + RoleGuard + `@Roles('platform_admin')`.
- Service computes platform-level counts: tenants, activeTenants, users, activeUsers, invoice count, open/in-progress support tickets, and subscription plan distribution via groupBy.
- Separation exists backend-side, but frontend `/admin` is still placeholder and not integrated with API/auth flow.

## 8. DATABASE DESIGN
- Prisma currently uses SQLite datasource (`provider = "sqlite"`, env DATABASE_URL).
- Core entities/relationships:
  - `Tenant` has many users, memberships, customers, invoices, inventory items/categories/movements, suppliers/purchases, roles/permissions/audit logs/support tickets/files.
  - `User` belongs to one tenant (legacy), has role column (legacy), and has many memberships.
  - `TenantMembership` is join table user↔tenant with role; unique(userId, tenantId).
  - `Customer`, `Invoice`, `InventoryItem`, `Supplier`, `Purchase`, `InventoryMovement`, `Role`, `Permission`, `AuditLog`, `SupportTicket`, `File` all carry tenantId.
  - `Payment` is linked to `Invoice` (no direct tenantId, tenant inferred via invoice relation).
- Migration history shown in repo:
  - baseline large schema migration (`20260309033902_add_payments_model`)
  - tenant membership migration (`20260310021000_add_tenant_memberships`).

## 9. FRONTEND ARCHITECTURE
- Next.js App Router with root layout and global CSS.
- Public marketing pages: `/` landing, `/pricing`, `/login`.
- Private dashboard pages under `/dashboard` with shared `dashboard/layout.tsx` wrapping `AppShell`.
- Dashboard currently uses static mock data (`mock-dashboard.ts`) and components (`MetricCard`, `RevenueChart`, activity stream, etc.).
- Platform admin page exists at `/admin` but is a simple static placeholder text.
- API integration in web is minimal (`getHealth()` in `src/lib/api.ts`); no full tenant-authenticated data wiring across dashboard modules yet.

## 10. IMPLEMENTED BUSINESS MODULES (STATUS)
- Auth: real register/login/jwt/me endpoints; membership-aware payload; production-safe JWT requirement.
- Tenants: create/list endpoints exist, but protected only by permissions and not platform boundary guard.
- Customers: CRUD + pagination/filtering + tenant scoping + permission guards.
- Inventory: categories/items/movements/stats/alerts APIs with tenant scoping.
- Invoices: CRUD/stats/status update, total calculations, customer tenant checks, optional stock deduction heuristics.
- Purchases: suppliers + purchases + receive/cancel + stats, with item/supplier tenant checks.
- Payments: CRUD-ish + invoice payment aggregation/status updates; tenant scoping through invoice relation.
- Support: ticket CRUD + filtering/stats.
- Files: upload/download/list/search/stats with storage provider and tenant scoping.
- Roles/Permissions: role/permission CRUD + assignment + permission checks + default role initializer.
- Platform admin: real overview endpoint.
- Frontend integration status: mostly UI/mock; business modules largely not connected to live backend except possible health checks.

## 11. SECURITY AUDIT (KEY RISKS)
1. **Legacy auth fields remain active**: `User.tenantId` and `User.role` still used as fallback when membership missing; this weakens strict membership-only model.
2. **Guard inconsistency**: Some controllers use `JwtAuthGuard + PermissionsGuard` without `TenantGuard` (e.g., payments/support/files/tenants), relying on permissions logic and decorator extraction alone.
3. **Potential unsafe updates**: some services call `update` with only `id` after tenant-scoped pre-check (e.g., support/files), which is usually safe if pre-check is trusted but less defensive than `updateMany` with tenantId in where.
4. **Permission matrix incompleteness**: `initializeDefaultRoles` only seeds a subset of modules (customers/invoices/inventory/purchases/roles), so endpoints requiring `files:*`, `support:*`, `payments:*`, `tenants:*` may be inaccessible by default.
5. **Tenants module boundary**: `tenants.findAll()` returns all tenants and can be exposed to non-platform principals if permissions are mis-assigned.
6. **Frontend auth separation incomplete**: `/dashboard` and `/admin` are not enforceably wired to backend auth/role state in app router middleware yet.

## 12. TEST COVERAGE
- HTTP e2e tests:
  - auth flow (`register/login/me`)
  - customers flow with permissions + cross-tenant assertions
  - health endpoints
- Data-level tests:
  - tenant isolation checks for customers/inventory and payments through invoice tenant relation
  - permission derivation correctness
- Integration/validation scripts:
  - transactional flow validation spec executes `validate-transactional-flow.js`
- Test setup resets and deploys Prisma migrations before test suite and truncates key tables before each test.
- Coverage is focused but not exhaustive (missing comprehensive tests for files/support/payments/platform-admin guards, and web integration tests).

## 13. WHAT IS REAL VS PLACEHOLDER
### Real functionality
- Backend auth + JWT strategy + RBAC/permissions + multi-tenant data models.
- Core CRUD services for customers/inventory/invoices/purchases/payments/support/files.
- Platform-admin overview API.
- Prisma schema and migrations.

### Placeholder / mock / incomplete
- Web dashboard data is mock-driven (`mock-dashboard.ts`) not API-driven.
- Web `/admin` route is placeholder static text.
- `packages/ui` has placeholder scripts (no real build/lint/test pipeline).
- Some test files are script-style/manual helpers (`manual-isolation-test.js`, PowerShell scripts) rather than formal automated CI coverage.

## 14. MAJOR ARCHITECTURAL STRENGTHS
- Clear modular NestJS structure with dedicated modules and service/controller boundaries.
- Explicit tenantId columns across most domain entities and consistent query-level scoping patterns.
- Introduction of `TenantMembership` improves correctness direction for multi-tenant RBAC.
- Permissions system is extensible and tenant-specific.
- Good foundational security posture in bootstrap (helmet, validation pipe, throttling).
- Platform admin backend boundary is explicit and guard-protected.

## 15. MAJOR ARCHITECTURAL WEAKNESSES
- Transitional state between legacy user role model and membership model causes policy ambiguity.
- Platform-vs-tenant boundary is not consistently enforced at all routes (especially tenants module and frontend/admin UX).
- RBAC seed defaults do not map to all implemented modules.
- Frontend is largely non-functional product surface (mostly static UI/mocks).
- Missing strict DTOs in some update endpoints (`any` usage in purchases/support/files update paths).
- SQLite runtime diverges from README target architecture (PostgreSQL + Redis), which can hide production differences.

## 16. NEXT DEVELOPMENT PRIORITIES (STRICT ORDER)
1. **Finalize auth/membership model**
   - eliminate legacy fallback to `User.role`/`User.tenantId` after migration completion.
   - require active membership for tenant endpoints.
2. **Enforce tenant/platform boundaries uniformly**
   - apply `TenantGuard` or equivalent global tenant-context policy to tenant modules.
   - restrict tenant management endpoints to platform-admin with dedicated guard/route group.
3. **Harden RBAC coverage**
   - expand permission seeds/migrations for payments/files/support/tenants/platform-admin actions.
   - add role-to-permission matrix tests.
4. **Business settings/configuration module**
   - implement tenant business settings + users/role assignments as first-class APIs.
5. **Complete operational modules**
   - customers/products(sku catalog)/sales-orders/inventory/billing workflows with end-to-end transactional invariants.
6. **Platform admin productization**
   - add platform-admin frontend tied to real API + role enforcement.
7. **Frontend integration pass**
   - replace dashboard mock data with real tenant-scoped API queries + auth middleware.
8. **Infra alignment**
   - plan migration from SQLite dev defaults to PostgreSQL + Redis jobs in environment-specific configs.

## 17. COMMANDS TO RUN THE PROJECT
From repo root:
- Install deps: `pnpm install`
- Run all apps in dev: `pnpm dev`
- Build all: `pnpm build`
- Lint all: `pnpm lint`
- Test all: `pnpm test`

API-specific:
- Dev server: `pnpm --filter @smartbitz/api dev`
- Build: `pnpm --filter @smartbitz/api build`
- Tests: `pnpm --filter @smartbitz/api test`
- E2E tests: `pnpm --filter @smartbitz/api test:e2e`
- Prisma generate: `pnpm --filter @smartbitz/api prisma:generate`
- Prisma migrate dev: `pnpm --filter @smartbitz/api prisma:migrate`

Web-specific:
- Dev server: `pnpm --filter @smartbitz/web dev`
- Build: `pnpm --filter @smartbitz/web build`

## 18. FILES MOST IMPORTANT TO REVIEW
1. `apps/api/src/database/prisma/schema.prisma`
2. `apps/api/src/modules/auth/auth.service.ts`
3. `apps/api/src/modules/auth/strategies/jwt.strategy.ts`
4. `apps/api/src/modules/roles/roles.service.ts`
5. `apps/api/src/modules/roles/guards/permissions.guard.ts`
6. `apps/api/src/common/guards/tenant.guard.ts`
7. `apps/api/src/common/guards/role.guard.ts`
8. `apps/api/src/modules/platform-admin/platform-admin.controller.ts`
9. `apps/api/src/modules/platform-admin/platform-admin.service.ts`
10. `apps/api/src/modules/customers/customers.service.ts`
11. `apps/api/src/modules/inventory/inventory.service.ts`
12. `apps/api/src/modules/invoices/invoices.service.ts`
13. `apps/api/src/modules/purchases/purchases.service.ts`
14. `apps/api/src/modules/payments/payments.service.ts`
15. `apps/api/src/modules/support/support.service.ts`
16. `apps/api/src/modules/files/files.service.ts`
17. `apps/api/test/setup.ts` and key e2e specs
18. `apps/web/src/app/page.tsx`, `apps/web/src/app/dashboard/page.tsx`, `apps/web/src/features/dashboard/data/mock-dashboard.ts`
19. `apps/web/src/app/admin/page.tsx`
20. `README.md`

