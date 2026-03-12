import type { PropsWithChildren, ReactNode } from 'react';

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: PropsWithChildren<{ title: string; description?: string; actions?: ReactNode; className?: string }>) {
  return (
    <section className={`section-card ${className ?? ''}`.trim()}>
      <header className="section-card-header">
        <div>
          <h2 className="section-card-title">{title}</h2>
          {description ? <p className="section-card-description">{description}</p> : null}
        </div>
        {actions ? <div className="section-card-actions">{actions}</div> : null}
      </header>
      <div>{children}</div>
    </section>
  );
}
