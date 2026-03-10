'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { TenantSwitcher } from '@/features/dashboard/components/tenant-switcher';

type NavItem = {
  href: string;
  label: string;
  icon: string;
  hint: string;
};

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Operations',
    items: [
      { href: '/dashboard', label: 'Command Center', icon: '◈', hint: 'Control ejecutivo' },
      { href: '/dashboard/clientes', label: 'Clientes', icon: '◉', hint: 'Cartera y segmentos' },
      { href: '/dashboard/facturacion', label: 'Facturación', icon: '◎', hint: 'Cobros y estado' },
      { href: '/dashboard/inventario', label: 'Inventario', icon: '◍', hint: 'Riesgos y reposición' },
      { href: '/dashboard/archivos', label: 'Archivos', icon: '◌', hint: 'Documentos y reportes' },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/dashboard/soporte', label: 'Soporte', icon: '◔', hint: 'Tickets y SLA' },
      { href: '/dashboard/configuracion', label: 'Configuración', icon: '◕', hint: 'Permisos y reglas' },
    ],
  },
  {
    label: 'System',
    items: [{ href: '/pricing', label: 'Plan / Suscripción', icon: '⬢', hint: 'Escalabilidad' }],
  },
];

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-brand">
          <Link href="/" className="logo">
            <span className="logo-dot" />
            SmartBitz
          </Link>
          <p className="app-header-text">Business Operating System · Nicaragua / LATAM</p>
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
                      <Link className={isActive ? 'nav-link nav-link-active' : 'nav-link'} href={item.href}>
                        <span className="nav-icon" aria-hidden="true">
                          {item.icon}
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
