import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterBar } from '@/components/ui/filter-bar';
import { ActionBar } from '@/components/ui/action-bar';
import { InputField } from '@/components/ui/input';
import { PageContainer } from '@/components/ui/page-container';
import { SectionCard } from '@/components/ui/section-card';
import { StatCard } from '@/components/ui/stat-card';

const files = [
  { name: 'INV-1038.pdf', module: 'Facturación', owner: 'María Campos', updated: 'Hoy 09:41', size: '512 KB' },
  { name: 'orden-compra-882.xml', module: 'Compras', owner: 'Carlos Ruiz', updated: 'Ayer 16:10', size: '86 KB' },
  { name: 'inventario-marzo.csv', module: 'Inventario', owner: 'Ana López', updated: 'Ayer 11:22', size: '1.2 MB' },
];

export default function ArchivosPage() {
  return (
    <PageContainer title="Archivos" subtitle="Repositorio documental por módulo con trazabilidad." actions={<Button>Subir archivo</Button>}>
      <div className="grid-3">
        <StatCard label="Almacenamiento" value="1.8 GB / 10 GB" trend="18% utilizado" />
        <StatCard label="Archivos este mes" value="238" trend="+34 vs mes anterior" />
        <StatCard label="Retención" value="24 meses" trend="Cumple política" tone="positive" />
      </div>

      <ActionBar>
        <FilterBar>
          <InputField label="Buscar" placeholder="Nombre de archivo" />
          <InputField label="Módulo" placeholder="Todos" />
          <InputField label="Propietario" placeholder="Usuario" />
        </FilterBar>
      </ActionBar>

      <SectionCard title="Biblioteca documental" description="Historial y trazabilidad documental para auditoría operativa.">
        <DataTable
          columns={[
            { key: 'name', label: 'Archivo' },
            { key: 'module', label: 'Módulo' },
            { key: 'owner', label: 'Propietario' },
            { key: 'updated', label: 'Última actualización' },
            { key: 'size', label: 'Tamaño' },
          ]}
          rows={files}
        />
      </SectionCard>

      <EmptyState title="Versionado automático" description="Conecta retención legal y versionado para auditoría por tenant." />
    </PageContainer>
  );
}
