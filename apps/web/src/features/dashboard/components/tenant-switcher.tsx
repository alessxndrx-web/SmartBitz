'use client';

import { useState } from 'react';
import { tenantContext, businessTypeLabels } from '@/features/dashboard/data/mock-dashboard';

const demoTenants = [
  tenantContext,
  {
    tenantName: 'Floristería Jardín Vivo',
    tenantSlug: 'jardin-vivo',
    businessType: 'FLORIST' as const,
    plan: 'Starter',
    city: 'León, Nicaragua',
  },
  {
    tenantName: 'TecnoExpress',
    tenantSlug: 'tecnoexpress',
    businessType: 'ELECTRONICS' as const,
    plan: 'Growth',
    city: 'Masaya, Nicaragua',
  },
];

export function TenantSwitcher() {
  const [selected, setSelected] = useState(demoTenants[0]);

  return (
    <div className="tenant-switcher">
      <label htmlFor="tenant-select">Negocio activo</label>
      <select
        id="tenant-select"
        className="tenant-select"
        value={selected.tenantSlug}
        onChange={(event) => {
          const match = demoTenants.find((item) => item.tenantSlug === event.target.value);
          if (match) setSelected(match);
        }}
      >
        {demoTenants.map((tenant) => (
          <option key={tenant.tenantSlug} value={tenant.tenantSlug}>
            {tenant.tenantName}
          </option>
        ))}
      </select>
      <p className="tenant-meta">{businessTypeLabels[selected.businessType]} · {selected.plan} · {selected.city}</p>
    </div>
  );
}
