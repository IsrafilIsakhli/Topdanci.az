import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';

export default function AboutPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container panel">
          <h1>Haqqımızda</h1>
          <p className="lead">
            TopdanBazar topdansatıcı mağazalarla alıcıları bir araya gətirən B2B lead-generation platformasıdır.
            Platforma satış əməliyyatı aparmır.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
