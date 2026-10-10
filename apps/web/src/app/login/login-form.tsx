'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ArrowRight, Loader2, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { ApiClientError } from '../../lib/api-client';
import { login } from '../../lib/seller-api';

const defaultDemoEmail = process.env.NEXT_PUBLIC_DEMO_SELLER_EMAIL || 'seller-demo@topdanci.az';
const defaultDemoPassword = process.env.NEXT_PUBLIC_DEMO_SELLER_PASSWORD || 'SellerDemo123!';

export function LoginForm({ next }: { next?: string | undefined }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(defaultDemoEmail);
  const [password, setPassword] = useState(defaultDemoPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await login(identifier, password);
      const fallback =
        response.user.role === 'ADMIN' || response.user.role === 'SUPER_ADMIN'
          ? '/admin'
          : response.user.role === 'SELLER'
            ? '/seller'
            : '/';
      router.push(next && next.startsWith('/') ? next : fallback);
      router.refresh();
    } catch (caught) {
      const status = caught instanceof ApiClientError ? caught.status : undefined;
      setError(status === 429 ? 'Çox cəhd etdiniz. Bir az sonra yenidən yoxlayın.' : 'E-poçt/telefon və ya şifrə yanlışdır.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="authx-wrap">
      <Link className="authx-brand" href="/">
        <span className="authx-brand-mark" aria-hidden="true">
          td
        </span>
        <span className="authx-brand-name">TopdanBazar</span>
      </Link>

      <form className="authx-card" onSubmit={handleSubmit} noValidate>
        <header className="authx-card-head">
          <h1>Xoş gəldiniz</h1>
          <p>Hesabınıza daxil olun.</p>
        </header>

        {error ? (
          <div className="authx-alert authx-alert-error" role="alert">
            {error}
          </div>
        ) : null}

        <label className="authx-field">
          <span>E-poçt və ya telefon</span>
          <span className="authx-input">
            <Mail size={17} />
            <input
              type="text"
              value={identifier}
              placeholder="numune@email.com və ya +994 ..."
              autoComplete="username"
              onChange={(event) => setIdentifier(event.target.value)}
              required
            />
          </span>
        </label>

        <label className="authx-field">
          <span>Şifrə</span>
          <span className="authx-input">
            <LockKeyhole size={17} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              placeholder="••••••••••"
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              className="authx-pass-toggle"
              type="button"
              aria-label={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </label>

        <div className="authx-row">
          <label className="authx-check">
            <input type="checkbox" defaultChecked />
            <span>
              <i aria-hidden="true">✓</i>
            </span>
            <em>Məni yadda saxla</em>
          </label>
          <Link className="authx-link" href="/contact">
            Şifrəni unutmusan?
          </Link>
        </div>

        <button className="authx-submit" type="submit" disabled={isSubmitting}>
          <span>{isSubmitting ? 'Daxil olunur…' : 'Daxil ol'}</span>
          {isSubmitting ? <Loader2 className="authx-spin" size={17} /> : <ArrowRight size={17} />}
        </button>
      </form>

      <p className="authx-alt">
        Hesabınız yoxdur? <Link href="/open-store">Pulsuz mağaza açın</Link>
      </p>
      <p className="authx-note">Demo giriş üçün test məlumatları əvvəlcədən doldurulub.</p>
    </div>
  );
}
