import Link from 'next/link';
import { BrandMark } from '@/components/ui/icon-system';

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
          <BrandMark className="brand-mark" aria-hidden="true" />
          <span>
            SmartBitz
            <small>Operating System para pymes</small>
          </span>
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
