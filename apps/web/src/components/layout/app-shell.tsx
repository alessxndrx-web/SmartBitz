'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { TenantSwitcher } from '@/features/dashboard/components/tenant-switcher';
import { AppIcon, BrandMark } from '@/components/ui/icon-system';

type NavItem = {
  href: string;
  label: string;
  icon: Parameters<typeof AppIcon>[0]['name'];
  hint: string;
};

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Operations',
    items: [
      { href: '/dashboard', label: 'Command Center', icon: 'dashboard', hint: 'Control ejecutivo' },
      { href: '/dashboard/clientes', label: 'Clientes', icon: 'customers', hint: 'Cartera y segmentos' },
      { href: '/dashboard/facturacion', label: 'Facturación', icon: 'billing', hint: 'Cobros y estado' },
      { href: '/dashboard/inventario', label: 'Inventario', icon: 'inventory', hint: 'Riesgos y reposición' },
      { href: '/dashboard/archivos', label: 'Archivos', icon: 'files', hint: 'Documentos y reportes' },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/dashboard/soporte', label: 'Soporte', icon: 'support', hint: 'Tickets y SLA' },
      { href: '/dashboard/configuracion', label: 'Configuración', icon: 'settings', hint: 'Permisos y reglas' },
    ],
  },
  {
    label: 'System',
    items: [{ href: '/pricing', label: 'Plan / Suscripción', icon: 'plan', hint: 'Escalabilidad' }],
  },
];

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-brand">
          <Link href="/" className="logo">
            <BrandMark className="brand-mark" aria-hidden="true" />
            <span>
              SmartBitz
              <small>Business Operating System · Nicaragua / LATAM</small>
            </span>
          </Link>
        </div>
        <div className="header-actions">
          <span className="status-badge status-badge-success">SLA 99.98%</span>
          <TenantSwitcher />
        </div>
      </header>

      <div className="app-body">
        <aside className="app-sidebar">
          <div className="sidebar-top">
            <p className="sidebar-eyebrow">Tenant Workspace</p>
            <h2>Comercial La Estrella</h2>
            <p className="sidebar-meta">Growth Plan · Managua · 3 sucursales conectadas</p>
          </div>

          {navGroups.map((group) => (
            <nav key={group.label} className="nav-group">
              <p className="nav-group-title">{group.label}</p>
              <ul>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                  return (
                    <li key={item.href}>
                      <Link className={isActive ? 'nav-link nav-link-active' : 'nav-link'} href={item.href} aria-label={item.label} title={item.label}>
                        <span className="nav-icon" aria-hidden="true">
                          <AppIcon name={item.icon} className="nav-icon-svg" />
                        </span>
                        <span className="nav-copy">
                          <strong>{item.label}</strong>
                          <small>{item.hint}</small>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
        </aside>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
