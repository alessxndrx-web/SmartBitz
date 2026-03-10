# SmartBitz API Conventions

Lightweight conventions to keep backend behavior predictable.

## 1) Pagination shape

List endpoints should return:

```json
{
  "<resourceKey>": [],
  "total": 0,
  "page": 1,
  "limit": 10,
  "totalPages": 0
}
```

Notes:
- `<resourceKey>` should be explicit (e.g., `customers`, `payments`, `invoices`).
- Query parameters should support `page` and `limit` where list volume can grow.

## 2) Stats endpoint naming

Use `GET /<module>/stats` for tenant-scoped aggregates unless there is a strong reason otherwise.

Examples:
- `/inventory/items/stats` (existing nested structure)
- `/invoices/stats`
- `/payments/stats`

## 3) Error semantics

- `401 Unauthorized`: invalid/expired token.
- `403 Forbidden`: authenticated but missing tenant context/role/permission.
- `404 Not Found`: resource not found within caller scope.

## 4) Update/delete return patterns

- Update endpoints: return updated entity when practical.
- Delete endpoints: return explicit acknowledgment shape:
  - `{ id, deleted: true }` or module-specific equivalent.

## 5) DTO naming

- `create-<module>.dto.ts` for creation.
- `update-<module>.dto.ts` for updates.
- `query-<module>.dto.ts` for list/filtering.

## 6) Route naming

- Prefer pluralized module roots (`/customers`, `/payments`, `/support`).
- Keep route names business-oriented and avoid transport/internal terms.
