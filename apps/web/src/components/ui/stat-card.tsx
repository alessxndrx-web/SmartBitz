import type { ReactNode } from 'react';
import { Card } from './card';

export function StatCard({
  label,
  value,
  trend,
  tone = 'default',
  actions,
}: {
  label: string;
  value: string;
  trend?: string;
  tone?: 'default' | 'positive' | 'warning';
  actions?: ReactNode;
}) {
  return (
    <Card className={`stat-card ${tone !== 'default' ? `stat-card-${tone}` : ''}`.trim()} actions={actions}>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      {trend ? <p className={`metric-trend ${tone === 'warning' ? 'metric-trend-warning' : ''}`.trim()}>{trend}</p> : null}
    </Card>
  );
}
