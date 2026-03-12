import { LinkButton } from './button';

export function ErrorState({
  title = 'No pudimos cargar esta sección',
  description,
  retryHref,
}: {
  title?: string;
  description: string;
  retryHref?: string;
}) {
  return (
    <section className="error-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {retryHref ? <LinkButton href={retryHref}>Reintentar</LinkButton> : null}
    </section>
  );
}
