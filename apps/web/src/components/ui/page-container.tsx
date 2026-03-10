import type { PropsWithChildren } from 'react';

type PageContainerProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export function PageContainer({ title, subtitle, children }: PageContainerProps) {
  return (
    <section className="page-container">
      <header className="page-header">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}
