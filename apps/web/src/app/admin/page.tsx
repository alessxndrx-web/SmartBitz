import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { DataTable } from '@/components/ui/data-table';
import { ErrorState } from '@/components/ui/error-state';
import { PageContainer } from '@/components/ui/page-container';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { getPlatformAdminOverview } from '@/lib/api';
import type { PlatformAdminOverviewResponse } from '@/lib/contracts';

async function loadOverview(): Promise<{ data: PlatformAdminOverviewResponse | null; error: string | null }> {
  try {
    const data = await getPlatformAdminOverview();
    return { data, error: null };
  } catch {
    return {
      data: null,
      error: 'No se pudo cargar el resumen de plataforma en este entorno.',
    };
  }
}

export default async function AdminPage() {
  const { data, error } = await loadOverview();

  const planRows = (data?.subscriptions ?? []).map((item) => ({
    plan: item.plan,
    tenants: item.count,
    status: item.count > 0 ? 'Activo' : 'Sin uso',
  }));

  return (
    <PageContainer
      title="Platform Admin"
      subtitle="Visión global de tenants, usuarios y salud operativa de SmartBitz."
      actions={<Button>Exportar reporte</Button>}
    >
      <div className="grid-4">
        <StatCard label="Tenants" value={String(data?.totals.tenants ?? '—')} trend={`Activos: ${data?.totals.activeTenants ?? '—'}`} />
        <StatCard label="Usuarios" value={String(data?.totals.users ?? '—')} trend={`Activos: ${data?.totals.activeUsers ?? '—'}`} />
        <StatCard label="Facturas" value={String(data?.totals.invoices.total ?? '—')} trend={`Pagadas: ${data?.totals.invoices.paid ?? '—'}`} />
        <StatCard label="Soporte" value={String(data?.totals.supportTickets.totalActive ?? '—')} trend={`Abiertos: ${data?.totals.supportTickets.open ?? '—'}`} tone="warning" />
      </div>

      <SectionCard title="Distribución de planes" description="Base para revenue ops y expansión comercial.">
        <DataTable
          columns={[
            { key: 'plan', label: 'Plan' },
            { key: 'tenants', label: 'Tenants' },
            {
              key: 'status',
              label: 'Estado',
              render: (value) => <StatusBadge tone={value === 'Activo' ? 'success' : 'warning'}>{String(value)}</StatusBadge>,
            },
          ]}
          rows={planRows}
          emptyText="No hay datos de planes disponibles aún."
        />
      </SectionCard>

      {error ? <ErrorState description={error} retryHref="/admin" /> : null}
    </PageContainer>
  );
}
