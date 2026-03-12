import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { FilterBar } from '@/components/ui/filter-bar';
import { ActionBar } from '@/components/ui/action-bar';
import { InputField } from '@/components/ui/input';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageContainer } from '@/components/ui/page-container';
import { SectionCard } from '@/components/ui/section-card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';

const stockRows = [
  { sku: 'ACE-900', product: 'Aceite 900ml', stock: 7, min: 15, status: 'Bajo' },
  { sku: 'AZU-1KG', product: 'Azúcar 1kg', stock: 5, min: 12, status: 'Crítico' },
  { sku: 'ARR-25LB', product: 'Arroz 80/20 25lb', stock: 14, min: 10, status: 'Estable' },
];

export default function InventarioPage() {
  return (
    <PageContainer title="Inventario" subtitle="Cobertura, alertas y reposición para operación diaria." actions={<Button>Registrar movimiento</Button>}>
      <div className="grid-3">
        <StatCard label="SKU activos" value="438" trend="29 sin movimiento" />
        <StatCard label="Bajo stock" value="17" trend="8 críticos" tone="warning" />
        <StatCard label="Cobertura promedio" value="18 días" trend="Objetivo > 21 días" />
      </div>

      <ActionBar>
        <FilterBar>
          <InputField label="Buscar SKU" placeholder="ACE-900" />
          <InputField label="Categoría" placeholder="Todas" />
          <InputField label="Estado" placeholder="Bajo stock" />
        </FilterBar>
      </ActionBar>

      <SectionCard title="Productos con alerta" description="Reglas de reabastecimiento por tenant y sucursal.">
        <DataTable
          columns={[
            { key: 'sku', label: 'SKU' },
            { key: 'product', label: 'Producto' },
            { key: 'stock', label: 'Stock' },
            { key: 'min', label: 'Mínimo' },
            {
              key: 'status',
              label: 'Estado',
              render: (value) => {
                const current = String(value);
                const tone = current === 'Estable' ? 'success' : 'warning';
                return <StatusBadge tone={tone}>{current}</StatusBadge>;
              },
            },
          ]}
          rows={stockRows}
        />
      </SectionCard>

      <div className="grid-2">
        <SectionCard title="Sincronización en tiempo real" description="Webhook ERP/POS en despliegue gradual.">
          <LoadingSkeleton lines={4} />
        </SectionCard>
        <EmptyState title="Predicción de quiebres" description="Activa forecast por categoría para anticipar riesgo de stock." actionLabel="Configurar forecast" actionHref="/dashboard/configuracion" />
      </div>
    </PageContainer>
  );
}
