import { PageContainer } from '@/components/ui/page-container';

export default function DashboardLoading() {
  return (
    <PageContainer title="Cargando dashboard" subtitle="Preparando métricas del negocio...">
      <section className="grid-2">
        <div className="skeleton-block" />
        <div className="skeleton-block" />
      </section>
      <section className="grid-3">
        <div className="skeleton-block" />
        <div className="skeleton-block" />
        <div className="skeleton-block" />
      </section>
    </PageContainer>
  );
}
