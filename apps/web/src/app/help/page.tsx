import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';

export default function HelpPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container panel">
          <h1>Yardım</h1>
          <p className="lead">Mağaza açmaq, məhsul əlavə etmək və müraciət statistikasını izləmək üçün dəstək mərkəzi.</p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
