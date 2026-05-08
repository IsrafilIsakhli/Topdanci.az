import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <strong className="brand">TopdanBazar</strong>
          <span>Azerbaycan B2B topdansatis platformasi.</span>
          <span>© 2026 TopdanBazar. Butun huquqlar qorunur.</span>
        </div>
        <div className="footer-col">
          <strong>Platforma</strong>
          <Link href="/about">Haqqimizda</Link>
          <Link href="/stores">Magazalar</Link>
          <Link href="/open-store">Magaza ac</Link>
        </div>
        <div className="footer-col">
          <strong>Huquqi</strong>
          <Link href="/terms">Istifadeci qaydalari</Link>
          <Link href="/privacy">Mexfilik siyaseti</Link>
        </div>
        <div className="footer-col">
          <strong>Destek</strong>
          <Link href="/help">Yardim</Link>
          <Link href="/contact">Elaqe</Link>
        </div>
      </div>
    </footer>
  );
}
