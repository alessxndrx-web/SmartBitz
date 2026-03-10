# SmartBitz Module Implementation Checklist

Use this checklist when creating or upgrading backend modules.

## A. Scope and boundary
- [ ] Is this module **tenant-scoped** or **platform-scoped**?
- [ ] Are routes placed under the correct world (tenant vs platform)?

## B. Controller and guards
- [ ] Tenant module uses `JwtAuthGuard + TenantGuard + PermissionsGuard`.
- [ ] Platform module uses `JwtAuthGuard + RoleGuard + @Roles('platform_admin')`.
- [ ] `@TenantId()` is used in tenant controller methods.

## C. DTOs and validation
- [ ] Create DTO with class-validator.
- [ ] Update DTO with class-validator.
- [ ] Query DTO for pagination/filtering if listing endpoint exists.
- [ ] No `any` at controller/service boundary.

## D. Service tenant safety
- [ ] All reads include tenant scoping.
- [ ] All writes include tenant scoping.
- [ ] Related entities are tenant-validated before mutation.
- [ ] Update/delete by raw id only is avoided.

## E. RBAC and permissions
- [ ] Permission strings added (`module:action`).
- [ ] `initializeDefaultRoles` updated if module is tenant-facing.
- [ ] Platform permissions not assigned to tenant roles.

## F. API consistency
- [ ] List endpoints follow shared pagination shape.
- [ ] Stats endpoint naming follows `<module>/stats`.
- [ ] Update/delete return pattern is consistent with existing module conventions.

## G. Tests
- [ ] Positive path test for authorized role.
- [ ] Forbidden test for missing permission.
- [ ] Tenant isolation test (cross-tenant denial).
- [ ] Missing tenant context rejection test.
- [ ] Platform boundary test if applicable.

## H. Dashboard/integration readiness
- [ ] Response shape is stable and predictable.
- [ ] Stats endpoint is suitable for dashboard consumption.
- [ ] Error behavior is documented and testable.

## I. Documentation
- [ ] Update engineering workflow/API docs if behavior changed.
- [ ] Add migration notes if schema/model changed.
