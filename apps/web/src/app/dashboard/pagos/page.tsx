import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { ErrorState } from '@/components/ui/error-state';
import { FilterBar } from '@/components/ui/filter-bar';
import { ActionBar } from '@/components/ui/action-bar';
import { InputField } from '@/components/ui/input';
import { PageContainer } from '@/components/ui/page-container';
import { SectionCard } from '@/components/ui/section-card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';

const payments = [
  { ref: 'PAY-8801', method: 'Transferencia', invoice: 'INV-1038', amount: 'C$ 14,200', status: 'Confirmado' },
  { ref: 'PAY-8800', method: 'Efectivo', invoice: 'INV-1037', amount: 'C$ 8,920', status: 'Pendiente' },
  { ref: 'PAY-8799', method: 'Tarjeta', invoice: 'INV-1035', amount: 'C$ 6,340', status: 'Rechazado' },
];

export default function PagosPage() {
  return (
    <PageContainer title="Pagos" subtitle="Control de cobros, conciliación y estado de transacciones." actions={<Button>Registrar pago</Button>}>
      <div className="grid-3">
        <StatCard label="Pagos del día" value="24" trend="C$ 128,340 recaudados" tone="positive" />
        <StatCard label="Pendientes" value="7" trend="2 requieren revisión" tone="warning" />
        <StatCard label="Tasa de aprobación" value="96.1%" trend="Pasarela principal" />
      </div>

      <ActionBar>
        <FilterBar>
          <InputField label="Referencia" placeholder="PAY-8801" />
          <InputField label="Método" placeholder="Todos" />
          <InputField label="Estado" placeholder="Confirmado" />
        </FilterBar>
      </ActionBar>

      <SectionCard title="Transacciones recientes" description="Vista de conciliación financiera por factura y método de pago.">
        <DataTable
          columns={[
            { key: 'ref', label: 'Referencia' },
            { key: 'method', label: 'Método' },
            { key: 'invoice', label: 'Factura' },
            { key: 'amount', label: 'Monto' },
            {
              key: 'status',
              label: 'Estado',
              render: (value) => {
                const text = String(value);
                const tone = text === 'Confirmado' ? 'success' : text === 'Pendiente' ? 'warning' : 'danger';
                return <StatusBadge tone={tone}>{text}</StatusBadge>;
              },
            },
          ]}
          rows={payments}
        />
      </SectionCard>

      <ErrorState description="Conector de pasarela para conciliación automática aún no disponible en este entorno." />
    </PageContainer>
  );
}
