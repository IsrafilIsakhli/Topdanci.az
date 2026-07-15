'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Bell,
  Home,
  ListChecks,
  LogOut,
  Menu,
  MoreHorizontal,
  Package,
  PanelLeftClose,
  Settings,
  Store,
  UserCircle,
  X,
} from 'lucide-react';
import { getSession, logout, type AuthUser } from '../../lib/seller-api';

const sellerNav = [
  { href: '/seller', label: 'Panel', icon: Home },
  { href: '/seller/products', label: 'Məhsullar', icon: Package },
  { href: '/seller/store', label: 'Mağaza profili', icon: Store },
  { href: '/seller/analytics', label: 'Statistika', icon: BarChart3 },
  { href: '/seller/leads', label: 'Müraciətlər', icon: ListChecks },
  { href: '/seller/settings', label: 'Ayarlar', icon: Settings },
];

const allowedRoles = new Set(['SELLER', 'ADMIN', 'SUPER_ADMIN']);
const sellerMobileNav = [
  { href: '/seller', label: 'Panel', icon: Home },
  { href: '/seller/products', label: 'Məhsullar', icon: Package },
  { href: '/seller/leads', label: 'Müraciətlər', icon: ListChecks },
  { href: '/seller/store', label: 'Mağaza', icon: Store },
];

const sellerMoreNav = [
  { href: '/seller/analytics', label: 'Statistika', icon: BarChart3 },
  { href: '/seller/settings', label: 'Ayarlar', icon: Settings },
];

export function SellerShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const moreSheetRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    setIsOpen(false);
    setIsMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMoreOpen) return;
    const triggerButton = moreButtonRef.current;
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements = () =>
      Array.from(moreSheetRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []).filter(
        (element) => element.getClientRects().length > 0,
      );
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMoreOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const elements = focusableElements();
      const first = elements[0];
      const last = elements.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const focusTimeout = window.setTimeout(() => focusableElements()[0]?.focus(), 50);
    return () => {
      window.clearTimeout(focusTimeout);
      window.removeEventListener('keydown', handleKeyDown);
      triggerButton?.focus();
    };
  }, [isMoreOpen]);

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
            <b>TopdanBazar</b>
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
                title={item.label}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
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
            <button className="seller-icon-button" type="button" aria-label="Bildirişlər">
              <Bell size={18} />
            </button>
            <button className="seller-icon-button seller-desktop-only" type="button" aria-label="Paneli yığ">
              <PanelLeftClose size={18} />
            </button>
          </div>
        </header>

        {children}
      </section>

      <nav className="seller-bottom-nav" aria-label="Satıcı paneli sürətli menyu">
        {sellerMobileNav.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/seller' ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link aria-current={isActive ? 'page' : undefined} href={item.href} key={item.href}>
              <Icon size={19} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          ref={moreButtonRef}
          className={sellerMoreNav.some((item) => pathname.startsWith(item.href)) ? 'is-active' : ''}
          type="button"
          aria-expanded={isMoreOpen}
          aria-controls="seller-more-menu"
          onClick={() => setIsMoreOpen((value) => !value)}
        >
          <MoreHorizontal size={19} />
          <span>Daha çox</span>
        </button>
      </nav>

      {isMoreOpen ? (
        <>
          <button className="dashboard-sheet-backdrop" type="button" aria-label="Əlavə menyunu bağla" onClick={() => setIsMoreOpen(false)} />
          <section
            ref={moreSheetRef}
            className="dashboard-more-sheet seller-more-sheet"
            id="seller-more-menu"
            aria-label="Əlavə satıcı menyusu"
            aria-modal="true"
            role="dialog"
          >
            <div className="dashboard-sheet-handle" aria-hidden="true" />
            <div className="dashboard-sheet-head">
              <span>
                <strong>{user.email ?? user.phone ?? 'Seller hesabı'}</strong>
                <small>{user.role}</small>
              </span>
              <button className="seller-icon-button" type="button" aria-label="Əlavə menyunu bağla" onClick={() => setIsMoreOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <nav className="dashboard-sheet-links">
              {sellerMoreNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link href={item.href} key={item.href}>
                    <Icon size={19} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button className="button button-full" type="button" onClick={() => void handleLogout(false)}>
              <LogOut size={17} />
              Çıxış
            </button>
          </section>
        </>
      ) : null}
    </main>
  );
}
