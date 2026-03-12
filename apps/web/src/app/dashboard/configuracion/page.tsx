import { SectionCard } from '@/components/ui/section-card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import { PageContainer } from '@/components/ui/page-container';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { ActionBar } from '@/components/ui/action-bar';

const users = [
  { name: 'Ana López', role: 'tenant_owner', status: 'Activo', lastAccess: 'Hoy 08:54' },
  { name: 'Carlos Ruiz', role: 'tenant_admin', status: 'Activo', lastAccess: 'Hoy 08:10' },
  { name: 'María Campos', role: 'staff', status: 'Invitado', lastAccess: 'Ayer 17:45' },
];

export default function ConfiguracionPage() {
  return (
    <PageContainer title="Configuración" subtitle="Gobierno del tenant, seguridad y controles operativos.">
      <div className="grid-3">
        <StatCard label="Usuarios activos" value="6" trend="1 invitación pendiente" />
        <StatCard label="MFA" value="67%" trend="Meta mínima 80%" tone="warning" />
        <StatCard label="Sesiones abiertas" value="14" trend="Sin incidentes" tone="positive" />
      </div>

      <SectionCard title="Equipo y roles" description="Modelo RBAC por membresía preparado para reglas granulares.">
        <DataTable
          columns={[
            { key: 'name', label: 'Usuario' },
            { key: 'role', label: 'Rol' },
            {
              key: 'status',
              label: 'Estado',
              render: (value) => <StatusBadge tone={value === 'Activo' ? 'success' : 'warning'}>{String(value)}</StatusBadge>,
            },
            { key: 'lastAccess', label: 'Último acceso' },
          ]}
          rows={users}
        />
      </SectionCard>

      <ActionBar>
        <div className="row">
          <ConfirmDialog
            triggerLabel="Cerrar sesiones activas"
            title="Cerrar todas las sesiones"
            description="Esta acción forzará reautenticación para todos los usuarios del tenant."
            confirmLabel="Cerrar sesiones"
          />
        </div>
      </ActionBar>
    </PageContainer>
  );
}
