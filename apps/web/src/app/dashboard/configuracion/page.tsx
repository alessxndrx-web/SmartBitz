import { Card } from '@/components/ui/card';
import { PageContainer } from '@/components/ui/page-container';

export default function ConfiguracionPage() {
  return (
    <PageContainer title="Configuración" subtitle="Ajustes del tenant, seguridad y preferencias del negocio.">
      <div className="grid-2">
        <Card title="Perfil del negocio" description="Datos fiscales y de contacto.">
          <ul className="plain-list">
            <li>Razón social: Comercial La Estrella S.A.</li>
            <li>RUC: J03100012345</li>
            <li>Sucursal principal: Managua</li>
          </ul>
        </Card>

        <Card title="Seguridad" description="Base para controles y acceso por roles.">
          <ul className="plain-list">
            <li>MFA: pendiente de activación</li>
            <li>Sesiones activas: 6</li>
            <li>Última actividad sospechosa: sin incidentes</li>
          </ul>
        </Card>
      </div>
    </PageContainer>
  );
}
