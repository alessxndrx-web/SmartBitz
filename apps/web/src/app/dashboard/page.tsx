import { SectionCard } from '@/components/ui/section-card';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/ui/page-container';
import { MetricCard } from '@/features/dashboard/components/metric-card';
import { DashboardMotion } from '@/components/motion/dashboard-motion';
import { RevenueChart } from '@/features/dashboard/components/revenue-chart';
import { AppIcon } from '@/components/ui/icon-system';
import { getPaymentsStats } from '@/lib/api';
import {
  tenantContext,
  businessTypeLabels,
  summaryKpis,
  revenueSeries,
  recentActivity,
  businessInsights,
  inventoryAlerts,
  fallbackPaymentsStats,
} from '@/features/dashboard/data/mock-dashboard';

const activityIcons = {
  invoice: 'invoice',
  customer: 'customer',
  inventory: 'warning',
  support: 'message',
  order: 'order',
} as const;

const actionLines = [
  'Contactar 5 clientes con facturas +15 días',
  'Emitir orden de compra para Aceite 900ml y Azúcar 1kg',
  'Ejecutar campaña de retención para clientes inactivos',
];

async function loadPaymentsStats() {
  try {
    return {
      stats: await getPaymentsStats(),
      source: 'api' as const,
    };
  } catch {
    return {
      stats: fallbackPaymentsStats,
      source: 'mock' as const,
    };
  }
}

export default async function DashboardPage() {
  const paymentsData = await loadPaymentsStats();

  const metrics = summaryKpis.map((metric) => {
    if (metric.label !== 'Ventas del mes') {
      return metric;
    }

    const value = `C$ ${paymentsData.stats.totalCollected.toLocaleString('es-NI', { maximumFractionDigits: 2 })}`;
    const trend = `${paymentsData.stats.totalPayments} pagos`;

    return {
      ...metric,
      value,
      trend,
    };
  });

  return (
    <PageContainer
      title={`Centro de mando · ${tenantContext.tenantName}`}
      subtitle={`Panel ejecutivo · ${businessTypeLabels[tenantContext.businessType]} · ${tenantContext.city}`}
      actions={
        <>
          <Button variant="secondary">Exportar snapshot</Button>
          <Button>Nuevo movimiento</Button>
        </>
      }
    >
      <DashboardMotion>
        <section className="decision-hero motion-fade-up">
          <p className="executive-eyebrow">Main Insight</p>
          <h2>Ingresos sólidos esta semana; el riesgo principal está en inventario y cobranza.</h2>
          <small>Fuente pagos: {paymentsData.source === 'api' ? 'API en vivo' : 'mock fallback'}</small>
        </section>

        <section className="decision-chart motion-fade-up">
          <header className="decision-section-head">
            <h3>Revenue Trend</h3>
          </header>
          <RevenueChart series={revenueSeries} />
        </section>

        <section className="decision-metrics motion-fade-up">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} trend={metric.trend} tone={metric.tone} />
          ))}
        </section>

        <section className="decision-bottom motion-fade-up">
          <SectionCard title="Operational Alerts" description="Riesgos y próximas acciones recomendadas" className="card-soft">
            <div className="alerts-stack">
              <ul className="alert-lines">
                {inventoryAlerts.map((item) => (
                  <li key={item.name}>
                    <span>{item.name}</span>
                    <strong>{item.stock} / min {item.min}</strong>
                  </li>
                ))}
              </ul>

              <div className="alert-insight-inline">
                <p>{businessInsights[1].title}</p>
                <small>{businessInsights[1].confidence}</small>
              </div>

              <ul className="alert-actions">
                {actionLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </SectionCard>

          <SectionCard title="Recent Activity" description="Eventos operativos en tiempo real" className="card-soft">
            <ol className="activity-stream">
              {recentActivity.map((item) => (
                <li key={`${item.title}-${item.time}`} className={`activity-item activity-item-${item.type}`}>
                  <span className="activity-dot" aria-hidden="true">
                    <AppIcon name={activityIcons[item.type]} className="activity-icon" />
                  </span>
                  <div>
                    <p className="activity-title">{item.title}</p>
                    <p className="activity-time">hace {item.time}</p>
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>
        </section>
      </DashboardMotion>
    </PageContainer>
  );
}
