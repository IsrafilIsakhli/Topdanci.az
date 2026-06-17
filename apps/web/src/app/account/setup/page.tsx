import { Suspense } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { SiteHeader } from '../../../components/site-header';
import { SetupPasswordForm } from './setup-password-form';

const setupBenefits = [
  'Mağaza hesabınızı təhlükəsiz aktiv edin',
  'Məhsullarınızı paneldən idarə edin',
  'Müraciət və lead statistikalarını izləyin',
];

export default function AccountSetupPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="form-shell">
        <div className="container auth-layout">
          <div className="auth-benefits">
            <KeyRound size={34} />
            <div>
              <h1>Mağaza hesabınızı aktiv edin</h1>
              <p>Admin təsdiqindən sonra göndərilən linklə şifrə yaradın və satıcı panelinə daxil olun.</p>
            </div>
            <div className="field-grid">
              {setupBenefits.map((benefit) => (
                <span key={benefit}>
                  <ShieldCheck size={17} /> {benefit}
                </span>
              ))}
            </div>
          </div>

          <Suspense fallback={<div className="auth-card">Hesab aktivləşdirmə formu hazırlanır...</div>}>
            <SetupPasswordForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
