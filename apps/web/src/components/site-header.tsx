'use client';

import Link from 'next/link';
import { Menu, Search, Store, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Ana səhifə' },
  { href: '/categories', label: 'Kateqoriyalar' },
  { href: '/stores', label: 'Mağazalar' },
  { href: '/products', label: 'Məhsullar' },
  { href: '/contact', label: 'Əlaqə' },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
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
            <Link key={item.href} href={item.href}>
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
            <Link key={item.href} href={item.href} onClick={closeMenu}>
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
  );
}
