# SmartBitz

SmartBitz es un SaaS multi-tenant para negocios en Nicaragua.

## Objetivo
Ayudar a negocios a llevar:
- registros contables
- facturación
- clientes
- inventario
- seguimiento por WhatsApp
- módulos operativos por rubro

## Rubros soportados
- Barberías
- Restaurantes
- Floristerías
- Gimnasios
- Manufactura
- Construcción

## Stack objetivo
- Frontend: Next.js
- Backend: NestJS
- DB: PostgreSQL
- Jobs: Redis
- ORM: Prisma

## Reglas del producto
- Un núcleo común compartido
- Módulos activados por tipo de negocio
- Aislamiento total entre tenants
- Panel admin global separado del panel tenant
- Demo de 3 días con suspensión automática

## MVP inicial
- Tenants
- Usuarios
- Clientes
- Facturas
- Inventario
- Dashboard base

## Engineering workflow docs
- `docs/engineering-workflow.md`
- `docs/module-implementation-checklist.md`
- `docs/testing-workflow.md`
- `docs/api-conventions.md`
- `docs/frontend-integration-plan.md`
- `docs/contribution-delivery-discipline.md`
