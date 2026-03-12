import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { FilterBar } from '@/components/ui/filter-bar';
import { ActionBar } from '@/components/ui/action-bar';
import { InputField } from '@/components/ui/input';
import { PageContainer } from '@/components/ui/page-container';
import { SectionCard } from '@/components/ui/section-card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';

const tickets = [
  { id: 'SUP-188', subject: 'Integración impresora fiscal', priority: 'Alta', status: 'Abierto', sla: '1h 24m' },
  { id: 'SUP-187', subject: 'Error al emitir factura', priority: 'Media', status: 'En progreso', sla: '2h 03m' },
  { id: 'SUP-186', subject: 'Carga masiva de clientes', priority: 'Baja', status: 'Resuelto', sla: '35m' },
];

export default function SoportePage() {
  return (
    <PageContainer title="Soporte" subtitle="Monitoreo de tickets, SLA y continuidad operativa." actions={<Button>Nuevo ticket</Button>}>
      <div className="grid-3">
        <StatCard label="Tickets abiertos" value="3" trend="1 alta prioridad" tone="warning" />
        <StatCard label="Tiempo promedio SLA" value="2h 40m" trend="-12% vs semana anterior" tone="positive" />
        <StatCard label="Resueltos hoy" value="11" trend="Backlog controlado" />
      </div>

      <ActionBar>
        <FilterBar>
          <InputField label="Buscar ticket" placeholder="SUP-188" />
          <InputField label="Prioridad" placeholder="Todas" />
          <InputField label="Estado" placeholder="Abierto" />
        </FilterBar>
      </ActionBar>

      <SectionCard title="Timeline de tickets" description="Visión operativa de soporte con foco en SLA y escalamiento.">
        <DataTable
          columns={[
            { key: 'id', label: 'Ticket' },
            { key: 'subject', label: 'Asunto' },
            { key: 'priority', label: 'Prioridad' },
            {
              key: 'status',
              label: 'Estado',
              render: (value) => {
                const text = String(value);
                const tone = text === 'Resuelto' ? 'success' : text === 'En progreso' ? 'warning' : 'danger';
                return <StatusBadge tone={tone}>{text}</StatusBadge>;
              },
            },
            { key: 'sla', label: 'SLA' },
          ]}
          rows={tickets}
        />
      </SectionCard>

      <EmptyState title="Automatización de respuestas" description="Configura respuestas automáticas y clasificación por prioridad." actionLabel="Configurar soporte" actionHref="/dashboard/configuracion" />
    </PageContainer>
  );
}
