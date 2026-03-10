import Link from 'next/link';
import { LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MarketingHeader } from '@/components/layout/marketing-header';
import { AppIcon } from '@/components/ui/icon-system';

const industries = [
  { name: 'Retail', detail: 'Control de caja, rotación y márgenes por categoría.' },
  { name: 'Servicios', detail: 'Seguimiento de clientes, tickets y facturación recurrente.' },
  { name: 'Floristerías', detail: 'Inventario perecedero, pedidos rápidos y entregas.' },
  { name: 'Electrónica', detail: 'SKU críticos, garantías y ventas por canal.' },
];

const steps = [
  'Conecta ventas, clientes e inventario en minutos.',
  'Activa alertas e insights según tipo de negocio.',
  'Opera con decisiones diarias desde un command center.',
];

const planPreview = [
  { name: 'Starter', price: 'US$19', note: 'Base operativa' },
  { name: 'Growth', price: 'US$49', note: 'Más inteligencia y control' },
  { name: 'Scale', price: 'Custom', note: 'Operación multi-sucursal' },
];

export default function MarketingPage() {
  return (
    <main className="marketing-page page-enter">
      <MarketingHeader />

      <section className="hero premium-hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">SmartBitz · Plataforma operativa para pymes de Nicaragua y LATAM</p>
          <h1>Un sistema operativo empresarial para gestionar crecimiento, riesgo y ejecución.</h1>
          <p>
            SmartBitz integra ventas, cobros, inventario y servicio en un command center premium que reduce riesgo,
            aumenta margen y profesionaliza decisiones diarias.
          </p>
          <div className="row">
            <LinkButton href="/pricing">Ver planes</LinkButton>
            <LinkButton href="/dashboard" variant="secondary">
              Explorar command center
            </LinkButton>
          </div>
        </div>

        <article className="hero-operating-board">
          <header>
            <p className="hero-eyebrow">Operating Snapshot</p>
            <h3>Comercial La Estrella · Managua</h3>
          </header>
          <div className="hero-kpi-grid">
            <article>
              <span>Ingresos del mes</span>
              <strong>C$ 182,450</strong>
            </article>
            <article>
              <span>Margen bruto</span>
              <strong>34.8%</strong>
            </article>
            <article>
              <span>Facturas activas</span>
              <strong>268</strong>
            </article>
            <article>
              <span>Alertas críticas</span>
              <strong>6</strong>
            </article>
          </div>
          <div className="hero-board-signals">
            <span className="status-badge status-badge-success">Ventas +14%</span>
            <span className="status-badge status-badge-warning">3 riesgos de stock</span>
          </div>
        </article>
      </section>

      <section className="showcase-grid">
        <Card className="showcase-main" title="Product Showcase" description="Cómo se ve operar con SmartBitz en el día a día.">
          <div className="showcase-columns">
            <article>
              <p className="hero-eyebrow">Business Overview</p>
              <h4>Estado real de caja, cobranza e inventario</h4>
              <p>Sin cambiar de módulo: métricas clave, riesgos y actividad en un solo panel ejecutivo.</p>
            </article>
            <article>
              <p className="hero-eyebrow">Action Layer</p>
              <h4>Recomendaciones listas para ejecutar</h4>
              <p>El sistema propone acciones priorizadas para proteger margen y acelerar crecimiento.</p>
            </article>
          </div>
        </Card>
        <Card title="How it works" description="Implementación en 3 pasos">
          <ol className="steps-list">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Card>
      </section>

      <section className="industry-grid">
        <header>
          <p className="hero-eyebrow">Industry Adaptation</p>
          <h2>Un núcleo, múltiples verticales de negocio</h2>
        </header>
        <div className="feature-section brand-feature-grid">
          {industries.map((industry) => (
            <Card key={industry.name} title={industry.name} description="Operación adaptada al contexto comercial.">
              <p>{industry.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="trust-strip">
        <Card title="Confiabilidad operacional" description="Infraestructura, seguridad y continuidad para negocio real.">
          <div className="trust-items">
            <span><AppIcon name="plan" className="inline-icon" />Multi-tenant seguro</span>
            <span><AppIcon name="support" className="inline-icon" />Soporte con SLA</span>
            <span><AppIcon name="dashboard" className="inline-icon" />Visión ejecutiva diaria</span>
          </div>
        </Card>
      </section>

      <section className="landing-pricing-teaser">
        <header>
          <p className="hero-eyebrow">Pricing</p>
          <h2>Planes pensados para crecer con disciplina operativa</h2>
        </header>
        <div className="pricing-teaser-grid">
          {planPreview.map((plan) => (
            <article key={plan.name} className="pricing-teaser-card">
              <p>{plan.name}</p>
              <strong>{plan.price}</strong>
              <small>{plan.note}</small>
            </article>
          ))}
        </div>
        <LinkButton href="/pricing" variant="secondary">Ver comparación completa</LinkButton>
      </section>

      <section className="dashboard-preview premium-preview">
        <header>
          <p className="hero-eyebrow">Vista de producto</p>
          <h2>Un sistema operativo de negocio, no otro dashboard genérico</h2>
          <p>
            Arquitectura editorial y asimétrica para separar estrategia, operación y alertas accionables en una sola pantalla.
          </p>
        </header>

        <div className="preview-shell">
          <aside className="preview-rail">
            <span className="preview-chip">Operating Insight</span>
            <p>Revenue trend saludable</p>
            <p>Riesgo de inventario controlable</p>
            <p>Clientes en riesgo de fuga</p>
            <p>Siguiente mejor acción recomendada</p>
          </aside>

          <div className="preview-main">
            <div className="preview-main-panel">
              <h3>Command Center</h3>
              <p>Información ejecutiva, inteligencia operacional y actividad en vivo integradas en un solo flujo de decisión.</p>
            </div>
            <div className="preview-tiles">
              <article>
                <span>Live Activity</span>
                <strong>INV-1031 pagada · C$ 14,200</strong>
              </article>
              <article>
                <span>Business Insight</span>
                <strong>14 clientes en riesgo de churn</strong>
              </article>
              <article>
                <span>Next Action</span>
                <strong>Reposición recomendada en 72h</strong>
              </article>
            </div>
          </div>
        </div>

        <Link href="/dashboard" className="command-link preview-link">
          Ir al dashboard completo
        </Link>
      </section>

      <section className="feature-section brand-feature-grid">
        <Card title="Control multi-negocio" description="Una misma plataforma para retail, servicios, floristería y electrónica.">
          <p>Contexto por tenant, operación por módulo y reglas configurables según tipo de negocio y etapa de crecimiento.</p>
        </Card>
        <Card title="Inteligencia accionable" description="No solo reportes: decisiones recomendadas con contexto.">
          <p>Detecta riesgos de caja, fuga de clientes e inventario crítico antes de que impacten utilidades.</p>
        </Card>
        <Card title="Plataforma vendible" description="Diseñada para verse y sentirse como software serio.">
          <p>Un producto con percepción premium y confianza empresarial desde el primer acceso.</p>
        </Card>
      </section>
    </main>
  );
}
