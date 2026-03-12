import type { PropsWithChildren, ReactNode } from 'react';
import { PageHeader } from './page-header';

type PageContainerProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}>;

export function PageContainer({ title, subtitle, actions, children }: PageContainerProps) {
  return (
    <section className="page-container">
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      {children}
    </section>
  );
}
