import type { PropsWithChildren } from 'react';
import { AppShell } from '@/components/layout/app-shell';

export default function AdminLayout({ children }: PropsWithChildren) {
  return <AppShell>{children}</AppShell>;
}
