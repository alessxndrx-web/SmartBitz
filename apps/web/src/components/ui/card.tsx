import type { PropsWithChildren, ReactNode } from 'react';

type CardProps = PropsWithChildren<{
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}>;

export function Card({ title, description, actions, className, children }: CardProps) {
  return (
    <section className={`card ${className ?? ''}`.trim()}>
      {title || description || actions ? (
        <header className="card-header">
          <div>
            {title ? <h3 className="card-title">{title}</h3> : null}
            {description ? <p className="card-description">{description}</p> : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </header>
      ) : null}
      <div>{children}</div>
    </section>
  );
}
