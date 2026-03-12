import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { ErrorState } from '@/components/ui/error-state';
import { FilterBar } from '@/components/ui/filter-bar';
import { ActionBar } from '@/components/ui/action-bar';
import { InputField } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { PageContainer } from '@/components/ui/page-container';
import { SectionCard } from '@/components/ui/section-card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';

const invoices = [
  { number: 'INV-1038', customer: 'Distribuidora Norte', due: '2026-03-21', amount: 'C$ 14,200', status: 'Pagada' },
  { number: 'INV-1037', customer: 'Taller Álvarez', due: '2026-03-18', amount: 'C$ 8,920', status: 'Pendiente' },
  { number: 'INV-1036', customer: 'Librería San Lucas', due: '2026-03-15', amount: 'C$ 3,450', status: 'Vencida' },
];

export default function FacturacionPage() {
  return (
    <PageContainer
      title="Facturación"
      subtitle="Control de emisión, vencimientos y cobranza por tenant."
      actions={<Button>Emitir factura</Button>}
    >
      <div className="grid-3">
        <StatCard label="Emitidas hoy" value="27" trend="+6 vs ayer" tone="positive" />
        <StatCard label="Pendientes" value="19" trend="7 vencen en 48h" tone="warning" />
        <StatCard label="Monto por cobrar" value="C$ 94,300" trend="Objetivo: 87% de cobranza" />
      </div>

      <ActionBar>
        <FilterBar>
          <InputField label="Buscar factura" placeholder="INV-1038" />
          <InputField label="Estado" placeholder="Todas" />
          <InputField label="Cliente" placeholder="Nombre o RUC" />
        </FilterBar>
      </ActionBar>

      <SectionCard title="Facturas recientes" description="Seguimiento operativo para cobro y conciliación.">
        <DataTable
          columns={[
            { key: 'number', label: 'Factura' },
            { key: 'customer', label: 'Cliente' },
            { key: 'due', label: 'Vence' },
            { key: 'amount', label: 'Monto' },
            {
              key: 'status',
              label: 'Estado',
              render: (value) => {
                const current = String(value);
                const tone = current === 'Pagada' ? 'success' : current === 'Pendiente' ? 'warning' : 'danger';
                return <StatusBadge tone={tone}>{current}</StatusBadge>;
              },
            },
          ]}
          rows={invoices}
        />
      </SectionCard>

      <div className="grid-2">
        <ErrorState description="Recordatorios automáticos por WhatsApp/Email aún en integración." retryHref="/dashboard/facturacion" />
        <EmptyState title="Automatizaciones de cobro" description="Configura flujos de cobranza por vencimiento y riesgo de churn." actionLabel="Configurar reglas" actionHref="/dashboard/configuracion" />
      </div>
    </PageContainer>
  );
}
