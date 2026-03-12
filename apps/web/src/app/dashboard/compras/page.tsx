import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { FilterBar } from '@/components/ui/filter-bar';
import { ActionBar } from '@/components/ui/action-bar';
import { InputField } from '@/components/ui/input';
import { PageContainer } from '@/components/ui/page-container';
import { SectionCard } from '@/components/ui/section-card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { ErrorState } from '@/components/ui/error-state';

const purchases = [
  { order: 'PO-201', supplier: 'Distribuidora Central', eta: '2026-03-23', amount: 'C$ 48,900', status: 'Aprobada' },
  { order: 'PO-200', supplier: 'Agroinsumos SA', eta: '2026-03-21', amount: 'C$ 18,420', status: 'En revisión' },
  { order: 'PO-199', supplier: 'Comercial Pacífico', eta: '2026-03-19', amount: 'C$ 9,880', status: 'Recibida' },
];

export default function ComprasPage() {
  return (
    <PageContainer title="Compras" subtitle="Planificación de abastecimiento y control de proveedores." actions={<Button>Nueva orden</Button>}>
      <div className="grid-3">
        <StatCard label="Órdenes abiertas" value="12" trend="4 por aprobar" tone="warning" />
        <StatCard label="Gasto proyectado" value="C$ 182,400" trend="Mes actual" />
        <StatCard label="Entregas a tiempo" value="91%" trend="+2.4%" tone="positive" />
      </div>

      <ActionBar>
        <FilterBar>
          <InputField label="Buscar orden" placeholder="PO-201" />
          <InputField label="Proveedor" placeholder="Todos" />
          <InputField label="Estado" placeholder="Aprobada" />
        </FilterBar>
      </ActionBar>

      <SectionCard title="Órdenes de compra" description="Seguimiento de aprobación, recepción y cumplimiento de proveedores.">
        <DataTable
          columns={[
            { key: 'order', label: 'Orden' },
            { key: 'supplier', label: 'Proveedor' },
            { key: 'eta', label: 'Entrega estimada' },
            { key: 'amount', label: 'Monto' },
            {
              key: 'status',
              label: 'Estado',
              render: (value) => {
                const text = String(value);
                const tone = text === 'Recibida' ? 'success' : text === 'Aprobada' ? 'warning' : 'danger';
                return <StatusBadge tone={tone}>{text}</StatusBadge>;
              },
            },
          ]}
          rows={purchases}
        />
      </SectionCard>

      <ErrorState description="Integración EDI con proveedores aún pendiente en este entorno." retryHref="/dashboard/compras" />
    </PageContainer>
  );
}
