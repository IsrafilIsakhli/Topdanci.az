import { Suspense } from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, Store, TrendingUp } from 'lucide-react';
import { SiteHeader } from '../../components/site-header';
import { LoginForm } from './login-form';

const benefits = [
  'Məhsullarınızı real vaxtda idarə edin',
  'WhatsApp və telefon kliklərini izləyin',
  'Yoxlamaya göndərilən məhsulları görün',
  'Təhlükəsiz mağaza panelinə daxil olun',
];

const loginStats = [
  { label: 'Aktiv vitrin', value: '400+' },
  { label: 'Məhsul idarəsi', value: '24/7' },
  { label: 'Yoxlanılmış satıcı', value: '100%' },
];

export default function LoginPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="form-shell login-shell">
        <div className="container auth-layout login-layout">
          <div className="auth-benefits">
            <div className="login-brand-row">
              <span className="login-store-badge">
                <Store size={22} />
              </span>
              <span>
                <strong>Satıcı paneli</strong>
                <small>Topdansatış idarəetmə mərkəzi</small>
              </span>
            </div>

            <div>
              <span className="login-kicker">
                <Sparkles size={15} />
                Premium mağaza girişi
              </span>
              <h1>TopdanBazar-a xoş gəlmisiniz</h1>
              <p>Mağazanızı və məhsullarınızı idarə etmək üçün hesabınızla daxil olun.</p>
            </div>

            <div className="login-stat-strip">
              {loginStats.map((item) => (
                <span key={item.label}>
                  <b>{item.value}</b>
                  <small>{item.label}</small>
                </span>
              ))}
            </div>

            <div className="field-grid">
              {benefits.map((benefit) => (
                <span key={benefit}>
                  <CheckCircle2 size={17} /> {benefit}
                </span>
              ))}
            </div>

            <div className="login-trust-note">
              <ShieldCheck size={17} />
              <span>Giriş məlumatlarınız qorunur, əməliyyatlar paneldə qeydə alınır.</span>
              <TrendingUp size={17} />
            </div>
          </div>

          <Suspense fallback={<div className="auth-card">Giriş formu hazırlanır...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
