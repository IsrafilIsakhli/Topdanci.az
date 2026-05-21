import { Suspense } from 'react';
import { CheckCircle2, Store } from 'lucide-react';
import { SiteHeader } from '../../components/site-header';
import { LoginForm } from './login-form';

const benefits = [
  'Məhsullarınızı real vaxtda idarə edin',
  'WhatsApp və telefon kliklərini izləyin',
  'Yoxlamaya göndərilən məhsulları görün',
  'Təhlükəsiz mağaza panelinə daxil olun',
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

          <Suspense fallback={<div className="auth-card">Giriş formu hazırlanır...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
