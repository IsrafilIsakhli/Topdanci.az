'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Home,
  ListChecks,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  Settings,
  Store,
  UserCircle,
  X,
} from 'lucide-react';
import { getSession, logout, type AuthUser } from '../../lib/seller-api';
import { NotificationCenter } from '../../components/notification-center';

const sellerNav = [
  { href: '/seller', label: 'Panel', icon: Home },
  { href: '/seller/products', label: 'Məhsullar', icon: Package },
  { href: '/seller/store', label: 'Mağaza profili', icon: Store },
  { href: '/seller/analytics', label: 'Statistika', icon: BarChart3 },
  { href: '/seller/leads', label: 'Müraciətlər', icon: ListChecks },
  { href: '/seller/settings', label: 'Ayarlar', icon: Settings },
];

const allowedRoles = new Set(['SELLER', 'ADMIN', 'SUPER_ADMIN']);

export function SellerShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const activeTitle = useMemo(() => {
    const current = sellerNav.find((item) => item.href === pathname);
    return current?.label ?? 'Mağaza paneli';
  }, [pathname]);

  useEffect(() => {
    let mounted = true;

    getSession()
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

  async function handleLogout(allDevices = false) {
    await logout(allDevices).catch(() => null);
    router.replace('/login');
    router.refresh();
  }

  if (isChecking || !user) {
    return (
      <main className="seller-auth-check">
        <div className="seller-loading-card">
          <Store size={28} />
          <strong>Mağaza paneli yoxlanılır</strong>
          <span>Hesab məlumatları təhlükəsiz şəkildə təsdiqlənir.</span>
        </div>
      </main>
    );
  }

  return (
    <main className="seller-shell">
      <aside className={`seller-sidebar${isOpen ? ' is-open' : ''}`}>
        <div className="seller-sidebar-head">
          <Link className="seller-brand" href="/seller" onClick={() => setIsOpen(false)}>
            <span>
              <Store size={18} />
            </span>
            TopdanBazar
          </Link>
          <button className="seller-icon-button seller-mobile-only" type="button" onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="seller-nav" aria-label="Mağaza paneli menyusu">
          {sellerNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/seller' ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                className={isActive ? 'is-active' : ''}
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="seller-sidebar-footer">
          <div className="seller-user-card">
            <UserCircle size={22} />
            <span>
              <strong>{user.email ?? user.phone ?? 'Seller hesabı'}</strong>
              <small>{user.role}</small>
            </span>
          </div>
          <button className="button button-full" type="button" onClick={() => void handleLogout(false)}>
            <LogOut size={16} />
            Çıxış
          </button>
        </div>
      </aside>

      {isOpen ? <button className="seller-drawer-backdrop" type="button" onClick={() => setIsOpen(false)} /> : null}

      <section className="seller-main">
        <header className="seller-topbar">
          <button className="seller-icon-button seller-mobile-only" type="button" onClick={() => setIsOpen(true)}>
            <Menu size={20} />
          </button>
          <div>
            <span className="seller-kicker">Satıcı mərkəzi</span>
            <h1>{activeTitle}</h1>
          </div>
          <div className="seller-topbar-actions">
            <NotificationCenter classPrefix="seller" />
            <button className="seller-icon-button seller-desktop-only" type="button" aria-label="Paneli yığ">
              <PanelLeftClose size={18} />
            </button>
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
