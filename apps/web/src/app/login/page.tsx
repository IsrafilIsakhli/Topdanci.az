import Link from 'next/link';
import { CheckCircle2, Lock, Store } from 'lucide-react';
import { SiteHeader } from '../../components/site-header';

const benefits = [
  '400+ tesdiqlenmis magaza',
  '200K+ topdansatis mehsulu',
  'WhatsApp ve telefon klik statistikasi',
  'Guvenli magaza paneli',
];

export default function LoginPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="form-shell">
        <div className="container auth-layout">
          <div className="auth-benefits">
            <Store size={34} />
            <div>
              <h1>TopdanBazar-a xos gelmisiniz</h1>
              <p>Magazanizi ve mehsullarinizi idare etmek ucun hesabinizla daxil olun.</p>
            </div>
            <div className="field-grid">
              {benefits.map((benefit) => (
                <span key={benefit}>
                  <CheckCircle2 size={17} /> {benefit}
                </span>
              ))}
            </div>
          </div>

          <form className="auth-card">
            <div>
              <h2>Daxil ol</h2>
              <p className="card-meta">Hesabiniza daxil olun ve magaza panelinizi idare edin.</p>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>E-poct ve ya telefon</span>
                <input type="text" placeholder="numune@email.com ve ya +994..." autoComplete="username" />
              </label>
              <label className="field">
                <span>Sifre</span>
                <input type="password" placeholder="********" autoComplete="current-password" />
              </label>
            </div>
            <button className="button button-primary button-full" type="submit">
              Daxil ol
              <Lock size={16} />
            </button>
            <p className="card-meta">
              Magazaniz yoxdur? <Link className="card-link" href="/open-store">Magaza ac</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
