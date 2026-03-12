import type { PropsWithChildren } from 'react';

type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export function StatusBadge({ tone = 'neutral', children }: PropsWithChildren<{ tone?: StatusTone }>) {
  const toneClass = tone === 'success'
    ? 'status-badge-success'
    : tone === 'warning'
      ? 'status-badge-warning'
      : tone === 'danger'
        ? 'status-badge-danger'
        : '';

  return <span className={`status-badge ${toneClass}`.trim()}>{children}</span>;
}
