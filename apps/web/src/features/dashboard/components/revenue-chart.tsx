'use client';

import { useMemo, useState } from 'react';

type RevenuePoint = {
  label: string;
  value: number;
};

export function RevenueChart({ series }: { series: RevenuePoint[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const max = useMemo(() => Math.max(...series.map((item) => item.value), 1), [series]);

  return (
    <div className="revenue-chart-wrap">
      <div className="revenue-chart-grid" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((line) => (
          <span key={line} className="revenue-grid-line" />
        ))}
      </div>

      <div className="revenue-chart-bars">
        {series.map((point, index) => {
          const percentage = Math.max(8, Math.round((point.value / max) * 100));
          const isActive = activeIndex === index;

          return (
            <button
              key={point.label}
              className={isActive ? 'revenue-bar revenue-bar-active' : 'revenue-bar'}
              style={{ height: `${percentage}%`, animationDelay: `${index * 0.06}s` }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(null)}
              type="button"
            >
              <span className="sr-only">
                {point.label}: C$ {point.value.toLocaleString('es-NI')}
              </span>
              <span className="revenue-axis-label">{point.label}</span>
              {isActive ? (
                <span className="revenue-tooltip">C$ {point.value.toLocaleString('es-NI')}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="revenue-axis-values" aria-hidden="true">
        <span>C$ 0</span>
        <span>C$ {Math.round(max * 0.25).toLocaleString('es-NI')}</span>
        <span>C$ {Math.round(max * 0.5).toLocaleString('es-NI')}</span>
        <span>C$ {Math.round(max * 0.75).toLocaleString('es-NI')}</span>
        <span>C$ {max.toLocaleString('es-NI')}</span>
      </div>
    </div>
  );
}
