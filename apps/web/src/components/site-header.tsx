'use client';

import Link from 'next/link';
import { Home, Menu, Package, Search, Store, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { href: '/', label: 'Ana səhifə' },
  { href: '/stores', label: 'Mağazalar' },
  { href: '/products', label: 'Məhsullar' },
  { href: '/contact', label: 'Əlaqə' },
];

const mobileQuickItems = [
  { href: '/', label: 'Ana', icon: Home },
  { href: '/products', label: 'Məhsullar', icon: Package },
  { href: '/stores', label: 'Mağazalar', icon: Store },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const hideMobileQuickNav =
    pathname === '/login' ||
    pathname === '/open-store' ||
    pathname === '/contact' ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/seller');
  const showMobileQuickNav = !hideMobileQuickNav;

  const closeMenu = () => setIsMenuOpen(false);
  const isActive = (href: string) => (href === '/' ? pathname === href : pathname.startsWith(href));

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
            <ThemeToggle />
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

          <ThemeToggle className="theme-toggle-mobile" />

          <button
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

        <div id="mobile-navigation" className={`mobile-drawer${isMenuOpen ? ' is-open' : ''}`}>
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
