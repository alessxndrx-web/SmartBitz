import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SmartBitz',
  description: 'ERP SaaS para negocios en Nicaragua',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}