import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';

export default function PrivacyPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container panel">
          <h1>Mexfilik siyaseti</h1>
          <p className="lead">
            Istifadeci, magaza ve lead analitikasi melumatlari yalniz platformanin tehlukesizliyi ve
            xidmet keyfiyyeti ucun emal olunur.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
