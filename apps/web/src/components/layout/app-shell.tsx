'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { TenantSwitcher } from '@/features/dashboard/components/tenant-switcher';
import { AppIcon, BrandMark } from '@/components/ui/icon-system';
import { StatusBadge } from '@/components/ui/status-badge';

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
      { href: '/dashboard', label: 'Dashboard', icon: 'dashboard', hint: 'Control ejecutivo' },
      { href: '/dashboard/clientes', label: 'Clientes', icon: 'customers', hint: 'CRM y segmentos' },
      { href: '/dashboard/facturacion', label: 'Facturas', icon: 'billing', hint: 'Cuentas por cobrar' },
      { href: '/dashboard/inventario', label: 'Inventario', icon: 'inventory', hint: 'Stock y alertas' },
      { href: '/dashboard/compras', label: 'Compras', icon: 'purchases', hint: 'Órdenes y proveedores' },
      { href: '/dashboard/pagos', label: 'Pagos', icon: 'payments', hint: 'Cobros y conciliación' },
    ],
  },
  {
    label: 'Service',
    items: [
      { href: '/dashboard/soporte', label: 'Soporte', icon: 'support', hint: 'Tickets y SLA' },
      { href: '/dashboard/archivos', label: 'Archivos', icon: 'files', hint: 'Adjuntos y evidencia' },
      { href: '/dashboard/configuracion', label: 'Configuración', icon: 'settings', hint: 'Equipo y permisos' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { href: '/admin', label: 'Platform Admin', icon: 'platform', hint: 'Tenants y planes' },
      { href: '/pricing', label: 'Plan / Suscripción', icon: 'plan', hint: 'Escalamiento' },
    ],
  },
];

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem('smartbitz-theme') as 'dark' | 'light' | null;
    const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    const selected = stored ?? preferred;
    setTheme(selected);
    document.documentElement.dataset.theme = selected;
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem('smartbitz-theme', next);
  };

  return (
    <div className={`app-shell ${collapsed ? 'app-shell-collapsed' : ''}`.trim()}>
      <header className="app-header">
        <div className="header-brand">
          <button className="sidebar-toggle" onClick={() => setCollapsed((value) => !value)} aria-label="Colapsar barra lateral">
            <AppIcon name="menu" className="nav-icon-svg" />
          </button>
          <Link href="/" className="logo">
            <BrandMark className="brand-mark" aria-hidden="true" />
            <span>
              SmartBitz
              <small>Multi-tenant business ops</small>
            </span>
          </Link>
        </div>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <StatusBadge tone="success">SLA 99.98%</StatusBadge>
          <div className="user-menu-chip">
            <span className="user-avatar" aria-hidden="true">AL</span>
            <div>
              <strong>Ana López</strong>
              <small>tenant_owner</small>
            </div>
          </div>
          <TenantSwitcher />
        </div>
      </header>

      <div className="app-body">
        <aside className="app-sidebar">
          <div className="sidebar-top">
            <p className="sidebar-eyebrow">Tenant Workspace</p>
            <h2>Comercial La Estrella</h2>
            <p className="sidebar-meta">Growth Plan · Managua · 3 sucursales</p>
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
