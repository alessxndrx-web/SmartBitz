# Frontend Integration Plan (Tenant + Platform)

This plan replaces mock-first dashboard rendering with incremental API integration.

## 1) Current state audit

- Tenant dashboard pages are UI-rich but rely on mock data.
- Platform admin page is placeholder and not connected to backend metrics.
- API utility layer is minimal (`getHealth`) and does not yet provide module-oriented clients.

## 2) Integration stages

### Stage A — Tenant auth/session baseline
- Add token-aware API client wrappers.
- Add route protection for private pages.
- Enforce role-aware route handling in app shell.

### Stage B — Tenant dashboard module data
Replace mocks in this order:
1. invoices stats
2. inventory stats/alerts
3. payments stats
4. support stats/activity
5. customers list snippets

Each module should support:
- loading state
- empty state
- API error state

### Stage C — Platform admin integration
- Connect `/admin` to `/api/platform-admin/overview`.
- Render plan distribution + health metrics.
- Restrict visibility by role-aware session checks.

### Stage D — Progressive hardening
- Introduce per-module adapters to map API responses into UI view models.
- Add integration tests for key data fetch paths.

## 3) Typed boundary recommendation

- Keep frontend contracts in `apps/web/src/lib/contracts.ts`.
- Do not couple UI directly to raw Prisma/Nest internals.
- Prefer lightweight adapters near module features.

## 4) Non-goals

- Full UI rewrite.
- Overengineered data fetching abstraction.
- Mixing platform and tenant analytics in the same surface.
