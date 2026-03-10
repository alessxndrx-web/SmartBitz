import type { PropsWithChildren } from 'react';

type CardProps = PropsWithChildren<{ title?: string }>;

export function Card({ title, children }: CardProps) {
  return (
    <section>
      {title ? <h3>{title}</h3> : null}
      <div>{children}</div>
    </section>
  );
}
