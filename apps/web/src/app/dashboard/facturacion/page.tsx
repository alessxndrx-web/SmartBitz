import { Card } from '@/components/ui/card';
import { PageContainer } from '@/components/ui/page-container';

export default function FacturacionPage() {
  return (
    <PageContainer title="Facturación" subtitle="Control de documentos, cobros y vencimientos.">
      <div className="grid-3">
        <Card title="Emitidas hoy">
          <p className="metric-value">27</p>
        </Card>
        <Card title="Pendientes de pago">
          <p className="metric-value">19</p>
        </Card>
        <Card title="Monto por cobrar">
          <p className="metric-value">C$ 94,300</p>
        </Card>
      </div>

      <Card title="Pipeline de cobro" description="Flujo preparado para integrar recordatorios automáticos.">
        <ul className="plain-list">
          <li>Por vencer (7 días): 11 facturas</li>
          <li>Vencidas (8-30 días): 6 facturas</li>
          <li>Vencidas (+30 días): 2 facturas</li>
        </ul>
      </Card>
    </PageContainer>
  );
}
