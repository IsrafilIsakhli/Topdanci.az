import Link from 'next/link';
import { Menu, Search, Store } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Ana sehife' },
  { href: '/categories', label: 'Kateqoriyalar' },
  { href: '/stores', label: 'Magazalar' },
  { href: '/products', label: 'Mehsullar' },
  { href: '/contact', label: 'Elaqe' },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="brand" aria-label="TopdanBazar ana sehife">
          <span className="brand-mark">
            <Store size={17} />
          </span>
          TopdanBazar
        </Link>

        <nav className="nav" aria-label="Esas menyu">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button className="button" type="button" aria-label="Axtaris">
            <Search size={18} />
          </button>
          <Link className="button" href="/login">
            Daxil ol
          </Link>
          <Link className="button button-primary" href="/open-store">
            <Store size={17} />
            Magaza ac
          </Link>
        </div>

        <button className="button mobile-menu-button" type="button" aria-label="Menyunu ac">
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}
