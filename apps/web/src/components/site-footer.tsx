import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col footer-brand-col">
          <strong className="brand">TopdanBazar</strong>
          <span>Azərbaycan B2B topdansatış əlaqə platforması.</span>
          <span>© 2026 TopdanBazar. Bütün hüquqlar qorunur.</span>
        </div>
        <div className="footer-col">
          <strong>Platforma</strong>
          <Link href="/about">Haqqımızda</Link>
          <Link href="/stores">Mağazalar</Link>
          <Link href="/open-store">Mağaza aç</Link>
        </div>
        <div className="footer-col">
          <strong>Hüquqi</strong>
          <Link href="/terms">İstifadəçi qaydaları</Link>
          <Link href="/privacy">Məxfilik siyasəti</Link>
        </div>
        <div className="footer-col">
          <strong>Dəstək</strong>
          <Link href="/help">Yardım</Link>
          <Link href="/contact">Əlaqə</Link>
        </div>
      </div>
    </footer>
  );
}
