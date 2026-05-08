import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';

export default function TermsPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container panel">
          <h1>Istifadeci qaydalari</h1>
          <p className="lead">
            TopdanBazar elaqe vasitesi kimi fealiyyet gosterir. Qiymet razilashmasi ve biznes danisiqlari
            alici ile magaza arasinda platformadan kenarda aparilir.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
