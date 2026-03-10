'use client';

import { useEffect } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer title="No pudimos cargar el dashboard" subtitle="Ocurrió un error inesperado.">
      <p className="helper-text">Intenta recargar esta vista o vuelve a intentarlo en unos segundos.</p>
      <Button onClick={reset}>Reintentar</Button>
    </PageContainer>
  );
}
