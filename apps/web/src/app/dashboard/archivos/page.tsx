import { Card } from '@/components/ui/card';
import { PageContainer } from '@/components/ui/page-container';

export default function ArchivosPage() {
  return (
    <PageContainer title="Archivos" subtitle="Repositorio documental por tenant y módulo.">
      <Card title="Gestión de archivos" description="Espacio preparado para facturas, contratos y adjuntos operativos.">
        <ul className="plain-list">
          <li>Última carga: factura INV-1028.pdf</li>
          <li>Uso actual: 1.8 GB de 10 GB</li>
          <li>Política de retención: 24 meses</li>
        </ul>
      </Card>
    </PageContainer>
  );
}
