import { Card } from '@/components/ui/card';
import { PageContainer } from '@/components/ui/page-container';

export default function SoportePage() {
  return (
    <PageContainer title="Soporte" subtitle="Seguimiento de casos técnicos y operativos del tenant.">
      <div className="grid-2">
        <Card title="Tickets abiertos">
          <p className="metric-value">3</p>
          <p className="metric-label">1 alta prioridad · 2 media</p>
        </Card>
        <Card title="SLA promedio">
          <p className="metric-value">2h 40m</p>
          <p className="metric-label">Últimos 7 días</p>
        </Card>
      </div>
    </PageContainer>
  );
}
