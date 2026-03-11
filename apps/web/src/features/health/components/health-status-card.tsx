import { getHealth } from '@/lib/api';
import { Card } from '@/components/ui/card';

export async function HealthStatusCard() {
  try {
    const health = await getHealth();

    return (
      <Card title="Estado de API" description="Conectividad con apps/api">
        <p>
          <strong>Status:</strong> {health?.status ?? 'ok'}
        </p>
      </Card>
    );
  } catch {
    return (
      <Card title="Estado de API" description="Conectividad con apps/api">
        <p className="status-error">No disponible</p>
      </Card>
    );
  }
}
