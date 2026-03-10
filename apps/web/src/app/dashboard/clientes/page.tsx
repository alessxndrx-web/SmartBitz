import { Card } from '@/components/ui/card';
import { PageContainer } from '@/components/ui/page-container';

export default function ClientesPage() {
  return (
    <PageContainer title="Clientes" subtitle="Gestión de cartera y seguimiento comercial.">
      <div className="grid-3">
        <Card title="Clientes totales">
          <p className="metric-value">1,024</p>
        </Card>
        <Card title="Nuevos este mes">
          <p className="metric-value">86</p>
        </Card>
        <Card title="Tasa de recompra">
          <p className="metric-value">42%</p>
        </Card>
      </div>

      <Card title="Segmentos sugeridos" description="Base para campañas y automatizaciones futuras.">
        <ul className="plain-list">
          <li>VIP (alto ticket): 74 clientes</li>
          <li>Frecuentes (2+ compras/mes): 212 clientes</li>
          <li>Inactivos (60+ días): 143 clientes</li>
        </ul>
      </Card>
    </PageContainer>
  );
}
