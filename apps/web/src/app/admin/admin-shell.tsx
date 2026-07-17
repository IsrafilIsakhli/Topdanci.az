'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  FileClock,
  FolderTree,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  ShieldCheck,
  Store,
  Users,
  X,
} from 'lucide-react';
import { getAdminSession } from '../../lib/admin-api';
import { logout, type AuthRole, type AuthUser } from '../../lib/seller-api';

type AdminNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: AuthRole[];
};

const adminNav: AdminNavItem[] = [
  { href: '/admin', label: 'Panel', icon: LayoutDashboard, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { href: '/admin/store-applications', label: 'Mağaza müraciətləri', icon: ClipboardCheck, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { href: '/admin/products', label: 'Məhsul moderasiyası', icon: PackageCheck, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { href: '/admin/stores', label: 'Mağazalar', icon: Store, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { href: '/admin/reports', label: 'Şikayətlər', icon: AlertTriangle, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { href: '/admin/analytics', label: 'Analitika', icon: BarChart3, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { href: '/admin/users', label: 'İstifadəçilər', icon: Users, roles: ['SUPER_ADMIN'] },
  { href: '/admin/categories', label: 'Kateqoriyalar', icon: FolderTree, roles: ['SUPER_ADMIN'] },
  { href: '/admin/audit-logs', label: 'Audit log', icon: FileClock, roles: ['SUPER_ADMIN'] },
  { href: '/admin/system', label: 'Sistem', icon: Activity, roles: ['SUPER_ADMIN'] },
] as const;

const allowedRoles = new Set(['ADMIN', 'SUPER_ADMIN']);

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const visibleNav = useMemo(
    () => adminNav.filter((item) => user && item.roles.includes(user.role as 'ADMIN' | 'SUPER_ADMIN')),
    [user],
  );

  const activeTitle = useMemo(() => {
    const current = adminNav.find((item) => item.href === pathname || (item.href !== '/admin' && pathname.startsWith(item.href)));
    return current?.label ?? 'Admin panel';
  }, [pathname]);

  useEffect(() => {
    let mounted = true;

    getAdminSession()
      .then((session) => {
        if (!mounted) return;
        if (!session.data.authenticated) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        if (!allowedRoles.has(session.data.user.role)) {
          router.replace('/');
          return;
        }
        setUser(session.data.user);
      })
      .catch(() => {
        if (mounted) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsChecking(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  async function handleLogout() {
    await logout(false).catch(() => null);
    router.replace('/login');
    router.refresh();
  }

  if (isChecking || !user) {
    return (
      <main className="admin-auth-check">
        <div className="admin-loading-card">
          <ShieldCheck size={30} />
          <strong>Admin panel yoxlanılır</strong>
          <span>Session və rol icazələri təhlükəsiz şəkildə təsdiqlənir.</span>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className={`admin-sidebar${isOpen ? ' is-open' : ''}`}>
        <div className="admin-sidebar-head">
          <Link className="admin-brand" href="/admin" onClick={() => setIsOpen(false)}>
            <span>
              <Gauge size={18} />
            </span>
            TopdanBazar Ops
          </Link>
          <button className="admin-icon-button admin-mobile-only" type="button" onClick={() => setIsOpen(false)} aria-label="Menyunu bağla">
            <X size={18} />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Admin panel menyusu">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link className={isActive ? 'is-active' : ''} href={item.href} key={item.href} onClick={() => setIsOpen(false)}>
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <ShieldCheck size={22} />
            <span>
              <strong>{user.email ?? user.phone ?? 'Admin hesabı'}</strong>
              <small>{user.role}</small>
            </span>
          </div>
          <button className="button button-full" type="button" onClick={() => void handleLogout()}>
            <LogOut size={16} />
            Çıxış
          </button>
        </div>
      </aside>

      {isOpen ? <button className="admin-drawer-backdrop" type="button" onClick={() => setIsOpen(false)} aria-label="Menyunu bağla" /> : null}

      <section className="admin-main">
        <header className="admin-topbar">
          <button className="admin-icon-button admin-mobile-only" type="button" onClick={() => setIsOpen(true)} aria-label="Admin menyusu">
            <Menu size={20} />
          </button>
          <div>
            <span className="admin-kicker">Platforma idarəetməsi</span>
            <h1>{activeTitle}</h1>
          </div>
          <span className="admin-role-badge">{user.role}</span>
        </header>

        {children}
      </section>
    </main>
  );
}
