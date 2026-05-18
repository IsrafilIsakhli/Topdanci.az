import Link from 'next/link';
import { CheckCircle2, Lock, Store } from 'lucide-react';
import { SiteHeader } from '../../components/site-header';

const benefits = [
  '400+ təsdiqlənmiş mağaza',
  '200K+ topdansatış məhsulu',
  'WhatsApp və telefon klik statistikası',
  'Güvənli mağaza paneli',
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
              <h1>TopdanBazar-a xoş gəlmisiniz</h1>
              <p>Mağazanızı və məhsullarınızı idarə etmək üçün hesabınızla daxil olun.</p>
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
              <p className="card-meta">Hesabınıza daxil olun və mağaza panelinizi idarə edin.</p>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>E-poçt və ya telefon</span>
                <input type="text" placeholder="numune@email.com və ya +994..." autoComplete="username" />
              </label>
              <label className="field">
                <span>Şifrə</span>
                <input type="password" placeholder="********" autoComplete="current-password" />
              </label>
            </div>
            <button className="button button-primary button-full" type="submit">
              Daxil ol
              <Lock size={16} />
            </button>
            <p className="card-meta">
              Mağazanız yoxdur?{' '}
              <Link className="card-link" href="/open-store">
                Mağaza aç
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
