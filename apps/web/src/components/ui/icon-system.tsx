import type { SVGProps } from 'react';

type IconName =
  | 'dashboard'
  | 'customers'
  | 'billing'
  | 'inventory'
  | 'files'
  | 'support'
  | 'settings'
  | 'plan'
  | 'invoice'
  | 'customer'
  | 'warning'
  | 'message'
  | 'order'
  | 'menu'
  | 'purchases'
  | 'payments'
  | 'platform';

const iconPaths: Record<IconName, string> = {
  dashboard: 'M4 5h7v6H4zm9 0h7v4h-7zM4 13h7v6H4zm9-2h7v8h-7z',
  customers: 'M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm8 2a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM2.5 20a5.5 5.5 0 0 1 11 0M12.5 20a3.5 3.5 0 0 1 7 0',
  billing: 'M5 3h14v18l-3-2-2 2-2-2-2 2-3-2zM8 8h8M8 12h8',
  inventory: 'M4 7 12 3l8 4-8 4zM4 7v8l8 4 8-4V7',
  files: 'M7 3h7l4 4v14H7zM14 3v4h4M9 13h6M9 17h6',
  support: 'M12 20v-3M7 10a5 5 0 1 1 10 0c0 2-1 3-3 4-1 .5-2 1.2-2 3',
  settings: 'M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Zm8 3-2.1.8a6.8 6.8 0 0 1-.2 1.2l1.3 1.9-1.9 1.9-1.9-1.3a6.8 6.8 0 0 1-1.2.2L12.5 20h-3l-.8-2.1a6.8 6.8 0 0 1-1.2-.2l-1.9 1.3-1.9-1.9 1.3-1.9a6.8 6.8 0 0 1-.2-1.2L3 11.5v-3l2.1-.8a6.8 6.8 0 0 1 .2-1.2L4 4.6 5.9 2.7l1.9 1.3a6.8 6.8 0 0 1 1.2-.2L11.5 2h3l.8 2.1a6.8 6.8 0 0 1 1.2.2l1.9-1.3L20.3 5l-1.3 1.9c.1.4.2.8.2 1.2l2.1.8z',
  plan: 'M12 3 3 8v8l9 5 9-5V8zM12 3v18M3 8l9 5 9-5',
  invoice: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',
  customer: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0',
  warning: 'M12 3 2 20h20zm0 6v5m0 3h.01',
  message: 'M4 5h16v11H8l-4 4z',
  order: 'M3 7h18M6 7v13h12V7M9 11h6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  purchases: 'M4 8h16M6 8l2 12h8l2-12M9 8V6a3 3 0 1 1 6 0v2',
  payments: 'M3 7h18v10H3zM3 11h18M8 16h3',
  platform: 'M12 3l9 5v8l-9 5-9-5V8zM12 8v13M3 8l9 5 9-5',
};

export function AppIcon({ name, className, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d={iconPaths[name]} />
    </svg>
  );
}

export function BrandMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 44 44" className={className} {...props}>
      <defs>
        <linearGradient id="smartbitzMark" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="38" height="38" rx="12" fill="url(#smartbitzMark)" />
      <path d="M14 14h16l-2.5 6H16.5l-1 3H29l-2.5 7H13l1.8-5.2H24l1-2.8H14z" fill="#F5F7FF" />
    </svg>
  );
}
