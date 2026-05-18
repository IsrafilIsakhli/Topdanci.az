import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';

export default function TermsPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container panel">
          <h1>İstifadəçi qaydaları</h1>
          <p className="lead">
            TopdanBazar əlaqə vasitəsi kimi fəaliyyət göstərir. Qiymət razılaşması və biznes danışıqları alıcı ilə mağaza
            arasında platformadan kənarda aparılır.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
