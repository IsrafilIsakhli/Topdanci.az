import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';

export default function PrivacyPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container panel">
          <h1>Məxfilik siyasəti</h1>
          <p className="lead">
            İstifadəçi, mağaza və lead analitikası məlumatları yalnız platformanın təhlükəsizliyi və xidmət keyfiyyəti
            üçün emal olunur.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
