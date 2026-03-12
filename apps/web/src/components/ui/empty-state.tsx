import { LinkButton } from './button';

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <section className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && actionHref ? <LinkButton href={actionHref} variant="secondary">{actionLabel}</LinkButton> : null}
    </section>
  );
}
