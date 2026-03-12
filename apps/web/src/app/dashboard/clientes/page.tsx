import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterBar } from '@/components/ui/filter-bar';
import { ActionBar } from '@/components/ui/action-bar';
import { InputField } from '@/components/ui/input';
import { PageContainer } from '@/components/ui/page-container';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';

const customers = [
  { name: 'Ferretería López', segment: 'Mayorista', status: 'Activo', lastOrder: 'Hace 2 días', lifetime: 'C$ 184,300' },
  { name: 'Restaurante El Patio', segment: 'Retail', status: 'En seguimiento', lastOrder: 'Hace 6 días', lifetime: 'C$ 96,120' },
  { name: 'Librería San Lucas', segment: 'Retail', status: 'Activo', lastOrder: 'Hoy', lifetime: 'C$ 42,910' },
];

export default function ClientesPage() {
  return (
    <PageContainer
      title="Clientes"
      subtitle="Gestión de cartera, segmentación y riesgo de churn por tenant."
      actions={<Button>Nuevo cliente</Button>}
    >
      <div className="grid-3">
        <StatCard label="Clientes totales" value="1,024" trend="+86 este mes" tone="positive" />
        <StatCard label="Clientes en riesgo" value="43" trend="12 requieren contacto hoy" tone="warning" />
        <StatCard label="Recompra" value="42%" trend="+3.2% vs mes anterior" tone="positive" />
      </div>

      <ActionBar>
      <FilterBar>
        <InputField label="Buscar" placeholder="Cliente, RUC o correo" />
        <InputField label="Segmento" placeholder="Todos" />
        <InputField label="Estado" placeholder="Activo" />
      </FilterBar>
      </ActionBar>

      <SectionCard title="Cartera de clientes" description="Listado operativo listo para CRM, facturación e historial de compras.">
        <DataTable
          columns={[
            { key: 'name', label: 'Cliente' },
            { key: 'segment', label: 'Segmento' },
            {
              key: 'status',
              label: 'Estado',
              render: (value) => <StatusBadge tone={value === 'Activo' ? 'success' : 'warning'}>{String(value)}</StatusBadge>,
            },
            { key: 'lastOrder', label: 'Última compra' },
            { key: 'lifetime', label: 'Valor histórico' },
          ]}
          rows={customers}
        />
      </SectionCard>

      <EmptyState
        title="Automatizaciones de cliente aún no configuradas"
        description="Conecta reglas de seguimiento para campañas, cobranza y retención por segmento."
        actionLabel="Configurar reglas"
        actionHref="/dashboard/configuracion"
      />
    </PageContainer>
  );
}
