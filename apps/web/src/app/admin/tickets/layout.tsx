'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useAdminUser } from '../admin-shell';
export default function Layout({ children }: { children: ReactNode }) {
  const user = useAdminUser();
  return user?.role === 'SUPER_ADMIN' ? (
    children
  ) : (
    <section className="admin-page">
      <div className="admin-state-card">
        <strong>Bu bölmə yalnız superadmin üçün açıqdır.</strong>
        <Link href="/admin">Panelə qayıt</Link>
      </div>
    </section>
  );
}
