import { Card } from '@/components/ui/card';
import { PageContainer } from '@/components/ui/page-container';

export default function InventarioPage() {
  return (
    <PageContainer title="Inventario" subtitle="Control de stock, rotación y abastecimiento.">
      <div className="grid-3">
        <Card title="SKU activos">
          <p className="metric-value">438</p>
        </Card>
        <Card title="Bajo stock">
          <p className="metric-value">17</p>
        </Card>
        <Card title="Sin movimiento (30d)">
          <p className="metric-value">29</p>
        </Card>
      </div>

      <Card title="Acciones sugeridas" description="Prioridades para mantener operación estable.">
        <ul className="plain-list">
          <li>Crear orden de compra para 8 productos críticos.</li>
          <li>Revisar productos de baja rotación para promociones.</li>
          <li>Configurar alertas por categoría.</li>
        </ul>
      </Card>
    </PageContainer>
  );
}
