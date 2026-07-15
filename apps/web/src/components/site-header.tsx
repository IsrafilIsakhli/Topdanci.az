'use client';

import Link from 'next/link';
import { Grid3X3, Home, Menu, Package, Search, Store, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const navItems = [
  { href: '/', label: 'Ana səhifə' },
  { href: '/categories', label: 'Kateqoriyalar' },
  { href: '/stores', label: 'Mağazalar' },
  { href: '/products', label: 'Məhsullar' },
  { href: '/contact', label: 'Əlaqə' },
];

const mobileQuickItems = [
  { href: '/', label: 'Ana', icon: Home },
  { href: '/categories', label: 'Kateqoriya', icon: Grid3X3 },
  { href: '/products', label: 'Məhsullar', icon: Package },
  { href: '/stores', label: 'Mağazalar', icon: Store },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const pathDepth = pathname.split('/').filter(Boolean).length;
  const isMarketplaceDetail =
    pathDepth > 1 &&
    (pathname.startsWith('/products/') || pathname.startsWith('/stores/') || pathname.startsWith('/categories/'));
  const hideMobileQuickNav =
    pathname === '/login' ||
    pathname === '/open-store' ||
    pathname === '/contact' ||
    isMarketplaceDetail ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/seller') ||
    pathname.startsWith('/admin');
  const showMobileQuickNav = !hideMobileQuickNav;

  const closeMenu = () => setIsMenuOpen(false);
  const isActive = (href: string) => (href === '/' ? pathname === href : pathname.startsWith(href));

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const triggerButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements = () =>
      Array.from(drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []).filter(
        (element) => element.getClientRects().length > 0,
      );
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
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

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    const focusTimeout = window.setTimeout(() => focusableElements()[0]?.focus(), 50);

    return () => {
      window.clearTimeout(focusTimeout);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      triggerButton?.focus();
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="site-header">
        <div className="container site-header-inner">
          <Link href="/" className="brand" aria-label="TopdanBazar ana səhifə" onClick={closeMenu}>
            <span className="brand-mark">
              <Store size={17} />
            </span>
            TopdanBazar
          </Link>

          <nav className="nav" aria-label="Əsas menyu">
            {navItems.map((item) => (
              <Link aria-current={isActive(item.href) ? 'page' : undefined} key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <form className="header-search" action="/products">
            <Search size={16} />
            <input name="q" placeholder="Məhsul axtar" aria-label="Məhsul axtar" />
          </form>

          <div className="header-actions">
            <Link className="button icon-button" href="/products" aria-label="Axtarış">
              <Search size={18} />
            </Link>
            <Link className="button" href="/login">
              Daxil ol
            </Link>
            <Link className="button button-primary" href="/open-store">
              <Store size={17} />
              Mağaza aç
            </Link>
          </div>

          <button
            ref={menuButtonRef}
            className="button mobile-menu-button"
            type="button"
            aria-label={isMenuOpen ? 'Menyunu bağla' : 'Menyunu aç'}
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div
          ref={drawerRef}
          id="mobile-navigation"
          className={`mobile-drawer${isMenuOpen ? ' is-open' : ''}`}
          aria-hidden={!isMenuOpen}
          aria-modal={isMenuOpen || undefined}
          role={isMenuOpen ? 'dialog' : undefined}
        >
          <nav className="mobile-drawer-nav" aria-label="Mobil menyu">
            {navItems.map((item) => (
              <Link aria-current={isActive(item.href) ? 'page' : undefined} key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mobile-drawer-actions">
            <Link className="button" href="/login" onClick={closeMenu}>
              Daxil ol
            </Link>
            <Link className="button button-primary" href="/open-store" onClick={closeMenu}>
              <Store size={16} />
              Mağaza aç
            </Link>
          </div>
        </div>
        {isMenuOpen ? <button className="mobile-drawer-backdrop" type="button" aria-label="Menyunu bağla" onClick={closeMenu} /> : null}
      </header>

      {showMobileQuickNav ? (
        <nav className="mobile-quick-nav" aria-label="Mobil sürətli menyu">
          {mobileQuickItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link aria-current={isActive(item.href) ? 'page' : undefined} href={item.href} key={item.href} onClick={closeMenu}>
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </>
  );
}
