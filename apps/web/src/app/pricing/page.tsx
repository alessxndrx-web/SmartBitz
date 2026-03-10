import { Card } from '@/components/ui/card';
import { LinkButton } from '@/components/ui/button';
import { MarketingHeader } from '@/components/layout/marketing-header';

const plans = [
  {
    name: 'Starter',
    price: 'US$19/mes',
    description: 'Para negocios emergentes que necesitan orden operativo y control de caja.',
    points: ['1 sucursal', 'Facturación + clientes', 'Hasta 2 usuarios', 'Onboarding guiado'],
  },
  {
    name: 'Growth',
    price: 'US$49/mes',
    description: 'Para pymes en expansión que requieren inteligencia y control multiarea.',
    points: ['Inventario + alertas', 'Hasta 10 usuarios', 'Soporte prioritario', 'Insights ejecutivos'],
    highlighted: true,
  },
  {
    name: 'Scale',
    price: 'Personalizado',
    description: 'Para operación multi-sucursal, mayor complejidad y gobierno de procesos.',
    points: ['Módulos por industria', 'Permisos avanzados', 'Acompañamiento dedicado', 'Acuerdos SLA extendidos'],
  },
];

export default function PricingPage() {
  return (
    <main className="marketing-page page-enter">
      <MarketingHeader />
      <section className="pricing-header premium-pricing-header">
        <p className="hero-eyebrow">Pricing para operar mejor, no para sobrevivir al caos</p>
        <h1>Planes diseñados para convertir administración manual en ventaja competitiva</h1>
        <p>
          Elige el nivel de control que tu negocio necesita hoy y escala a medida que crecen tus ventas, equipo y sucursales.
        </p>
      </section>

      <section className="feature-section pricing-grid-premium">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.highlighted ? 'card-highlight pricing-featured' : 'pricing-plan-card'} title={plan.name} description={plan.description}>
            <p className="plan-price">{plan.price}</p>
            <ul className="plain-list">
              {plan.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <div style={{ marginTop: 16 }}>
              <LinkButton href="/login" variant={plan.highlighted ? 'primary' : 'secondary'}>
                Iniciar demo
              </LinkButton>
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}
