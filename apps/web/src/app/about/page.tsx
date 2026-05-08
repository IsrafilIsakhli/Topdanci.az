import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';

export default function AboutPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container panel">
          <h1>Haqqimizda</h1>
          <p className="lead">
            TopdanBazar topdansatici magazalarla alicilari bir araya getiren B2B lead-generation
            platformasidir. Platforma satis emeliyyati aparmir.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
