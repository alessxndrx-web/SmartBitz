import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InputField } from '@/components/ui/input';
import { MarketingHeader } from '@/components/layout/marketing-header';

export default function LoginPage() {
  return (
    <main className="login-page page-enter">
      <MarketingHeader />

      <section className="login-brand premium-login-brand">
        <p className="hero-eyebrow">SmartBitz Workspace</p>
        <h1>Entra al sistema operativo de tu negocio</h1>
        <p>
          Visualiza tu operación con claridad ejecutiva: ingresos, riesgos, actividad y próximos pasos, en un entorno seguro y premium.
        </p>
        <ul className="plain-list">
          <li>Contexto multi-tenant por industria y sucursal.</li>
          <li>Alertas y señales que priorizan acciones con impacto.</li>
          <li>Experiencia coherente entre marketing, venta y operación.</li>
        </ul>
      </section>

      <Card className="login-card premium-login-card" title="Iniciar sesión" description="Accede con tus credenciales SmartBitz para abrir tu command center.">
        <form className="stack">
          <InputField label="Correo corporativo" name="email" type="email" placeholder="admin@empresa.com" required />
          <InputField label="Contraseña" name="password" type="password" hint="Usa las credenciales asignadas por tu administrador." required />
          <Button type="submit">Entrar al panel</Button>
          <p className="helper-text">¿No puedes ingresar? Contacta a soporte del tenant o a tu administrador interno.</p>
        </form>
      </Card>
    </main>
  );
}
