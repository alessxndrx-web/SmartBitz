import Link from 'next/link';

const links = [
  { href: '/', label: 'Producto' },
  { href: '/pricing', label: 'Planes' },
  { href: '/login', label: 'Acceder' },
];

export function MarketingHeader() {
  return (
    <header className="marketing-header">
      <div className="marketing-header-inner">
        <Link href="/" className="marketing-logo">
          <span className="marketing-logo-dot" />
          SmartBitz
        </Link>

        <nav>
          <ul className="marketing-nav">
            {links.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link href="/dashboard" className="header-cta">
          Ver dashboard
        </Link>
      </div>
    </header>
  );
}
