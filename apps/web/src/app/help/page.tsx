import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';

export default function HelpPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container panel">
          <h1>Yardim</h1>
          <p className="lead">
            Magaza acmaq, mehsul elave etmek ve muraciet statistikasini izlemek ucun destek merkezi.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
