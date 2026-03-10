import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PageContainer } from '@/components/ui/page-container';
import { HealthStatusCard } from '@/features/health/components/health-status-card';
import { MetricCard } from '@/features/dashboard/components/metric-card';
import { DashboardMotion } from '@/components/motion/dashboard-motion';
import { RevenueChart } from '@/features/dashboard/components/revenue-chart';
import {
  tenantContext,
  businessTypeLabels,
  summaryKpis,
  inventoryAlerts,
  recentInvoices,
  revenueSeries,
  recentActivity,
  businessInsights,
} from '@/features/dashboard/data/mock-dashboard';

export default function DashboardPage() {
  return (
    <PageContainer
      title={`Centro de mando · ${tenantContext.tenantName}`}
      subtitle={`Inteligencia operativa para ${businessTypeLabels[tenantContext.businessType]} · ${tenantContext.city}`}
    >
      <DashboardMotion>
        <section className="command-stage motion-fade-up">
          <article className="command-hero">
            <p className="executive-eyebrow">Operating Core</p>
            <h2>Ventas crecen con fuerza, pero tu margen y abastecimiento requieren decisiones hoy.</h2>
            <p className="command-context">
              SmartBitz detecta expansión comercial en el canal minorista y una presión operativa en 3 SKU de alta rotación.
              Prioriza cobranza, reposición y campañas para proteger caja esta semana.
            </p>
            <div className="command-actions">
              <span className="status-badge status-badge-success">Ingresos +14%</span>
              <span className="status-badge status-badge-warning">Riesgo operativo medio</span>
              <Link href="/dashboard/facturacion" className="command-link">
                Ejecutar plan de cobranza
              </Link>
            </div>
            <div className="insight-chart-wrap">
              <RevenueChart series={revenueSeries} />
            </div>
          </article>

          <aside className="command-rail">
            <Card className="command-snapshot" title="Business Overview" description="Lectura rápida para la gerencia.">
              <div className="snapshot-kpis">
                <article>
                  <span>Ingresos netos</span>
                  <strong>C$ 182,450</strong>
                </article>
                <article>
                  <span>Facturas por vencer</span>
                  <strong>11</strong>
                </article>
                <article>
                  <span>Órdenes sugeridas</span>
                  <strong>8</strong>
                </article>
              </div>
            </Card>

            <Card className="next-actions" title="Next Best Actions" description="Acciones recomendadas por impacto.">
              <ul className="action-list">
                <li>Contactar 5 clientes con facturas +15 días.</li>
                <li>Generar orden de compra para Aceite 900ml y Azúcar 1kg.</li>
                <li>Lanzar campaña de retención para clientes inactivos &gt;45 días.</li>
              </ul>
            </Card>
          </aside>
        </section>

        <section className="dashboard-kpi-ribbon motion-fade-up">
          <p className="section-kicker">Business Overview</p>
          {summaryKpis.map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} trend={metric.trend} tone={metric.tone} />
          ))}
        </section>

        <section className="ops-editorial-grid motion-fade-up">
          <p className="section-kicker section-kicker-wide">Business Insights · Operational Risk · Recent Activity · Quick Actions</p>
          <Card title="Business Insights" description="Señales inteligentes para decisiones ejecutivas." className="card-soft insights-hub">
            <div className="insights-list">
              {businessInsights.map((insight) => (
                <article key={insight.title} className="insight-item">
                  <p className="insight-tag">{insight.tag}</p>
                  <h4>{insight.title}</h4>
                  <p>{insight.text}</p>
                  <p className="insight-confidence">{insight.confidence}</p>
                </article>
              ))}
            </div>
          </Card>

          <Card title="Recent Activity" description="Flujo vivo de eventos operativos." className="card-soft timeline-hub">
            <ol className="activity-stream">
              {recentActivity.map((item) => (
                <li key={`${item.title}-${item.time}`} className={`activity-item activity-item-${item.type}`}>
                  <span className="activity-dot" aria-hidden="true">
                    {item.icon}
                  </span>
                  <div>
                    <p className="activity-title">{item.title}</p>
                    <p className="activity-detail">{item.detail}</p>
                    <p className="activity-time">hace {item.time}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <div className="ops-stack">
            <Card title="Operational Risk" description="Productos con impacto directo en ventas si no se repone." className="card-soft">
              <ul className="table-list">
                {inventoryAlerts.map((item) => (
                  <li key={item.name}>
                    <span>{item.name}</span>
                    <span className="status-badge status-badge-warning">
                      {item.stock} / min {item.min}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Revenue Trend Context" description="Movimientos recientes y estado de cobro." className="card-soft">
              <ul className="table-list">
                {recentInvoices.map((invoice) => (
                  <li key={invoice.number}>
                    <span>
                      {invoice.number} · {invoice.customer}
                      <small className="helper-text"> {invoice.status}</small>
                    </span>
                    <strong>{invoice.total}</strong>
                  </li>
                ))}
              </ul>
            </Card>

            <HealthStatusCard />

            <Card title="Quick Actions" description="Acciones de alto impacto para la operación diaria." className="card-soft">
              <div className="module-grid module-grid-compact">
                <Link href="/dashboard/clientes" className="module-tile">
                  Clientes
                </Link>
                <Link href="/dashboard/facturacion" className="module-tile">
                  Facturación
                </Link>
                <Link href="/dashboard/inventario" className="module-tile">
                  Inventario
                </Link>
                <Link href="/dashboard/soporte" className="module-tile">
                  Soporte
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </DashboardMotion>
    </PageContainer>
  );
}
