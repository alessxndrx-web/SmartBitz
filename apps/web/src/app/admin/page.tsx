import { Card } from '@/components/ui/card';
import { PageContainer } from '@/components/ui/page-container';
import { getPlatformAdminOverview } from '@/lib/api';
import type { PlatformAdminOverviewResponse } from '@/lib/contracts';

async function loadOverview(): Promise<{ data: PlatformAdminOverviewResponse | null; error: string | null }> {
  try {
    const data = await getPlatformAdminOverview();
    return { data, error: null };
  } catch {
    return {
      data: null,
      error: 'No se pudo cargar el resumen de plataforma. Mostrando estado de integración pendiente.',
    };
  }
}

export default async function AdminPage() {
  const { data, error } = await loadOverview();

  return (
    <PageContainer
      title="Panel Admin Global"
      subtitle="Visión de tenants, usuarios y operaciones de plataforma"
    >
      <div className="decision-metrics">
        <Card title="Tenants" className="card-soft">
          <p>{data?.totals.tenants ?? '—'}</p>
          <small>Activos: {data?.totals.activeTenants ?? '—'}</small>
        </Card>

        <Card title="Usuarios" className="card-soft">
          <p>{data?.totals.users ?? '—'}</p>
          <small>Activos: {data?.totals.activeUsers ?? '—'}</small>
        </Card>

        <Card title="Facturas" className="card-soft">
          <p>{data?.totals.invoices.total ?? '—'}</p>
          <small>Pagadas: {data?.totals.invoices.paid ?? '—'}</small>
        </Card>
      </div>

      <section className="decision-bottom">
        <Card title="Distribución de planes" className="card-soft">
          <ul className="alert-lines">
            {(data?.subscriptions ?? []).map((item) => (
              <li key={item.plan}>
                <span>{item.plan}</span>
                <strong>{item.count}</strong>
              </li>
            ))}
          </ul>
          {!data?.subscriptions?.length && <p>Sin datos de planes disponibles.</p>}
        </Card>

        <Card title="Estado de integración" className="card-soft">
          <p>{error ?? 'Integración activa con /api/platform-admin/overview.'}</p>
        </Card>
      </section>
    </PageContainer>
  );
}
