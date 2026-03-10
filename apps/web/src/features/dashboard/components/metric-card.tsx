import { Card } from '@/components/ui/card';

type MetricCardProps = {
  label: string;
  value: string;
  trend: string;
  tone?: 'positive' | 'warning';
};

export function MetricCard({ label, value, trend, tone = 'positive' }: MetricCardProps) {
  return (
    <Card className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      <p className={tone === 'warning' ? 'metric-trend metric-trend-warning' : 'metric-trend'}>{trend}</p>
    </Card>
  );
}
