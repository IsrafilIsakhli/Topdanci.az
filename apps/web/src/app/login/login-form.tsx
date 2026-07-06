'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Lock, Loader2, ShieldCheck } from 'lucide-react';
import { ApiClientError } from '../../lib/api-client';
import { login } from '../../lib/seller-api';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState('seller-demo@topdanci.az');
  const [password, setPassword] = useState('SellerDemo123!');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await login(identifier, password);
      const next = searchParams.get('next');
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
    <form className="auth-card login-form-card" onSubmit={handleSubmit}>
      <div className="login-form-head">
        <span className="login-form-badge">
          <ShieldCheck size={15} />
          Təhlükəsiz giriş
        </span>
        <h2>Daxil ol</h2>
        <p className="card-meta">Hesabınıza daxil olun və mağaza panelinizi idarə edin.</p>
      </div>

      {error ? <div className="form-alert form-alert-error">{error}</div> : null}

      <div className="field-grid">
        <label className="field">
          <span>E-poçt və ya telefon</span>
          <input
            type="text"
            value={identifier}
            placeholder="numune@email.com və ya +994..."
            autoComplete="username"
            onChange={(event) => setIdentifier(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Şifrə</span>
          <input
            type="password"
            value={password}
            placeholder="********"
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
      </div>

      <div className="login-form-options">
        <label>
          <input type="checkbox" defaultChecked />
          <span>Məni yadda saxla</span>
        </label>
        <Link href="/contact">Şifrə ilə bağlı kömək</Link>
      </div>

      <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="spin-icon" size={16} /> : <Lock size={16} />}
        Daxil ol
      </button>
      <p className="card-meta login-open-store-link">
        Mağazanız yoxdur?{' '}
        <Link className="card-link" href="/open-store">
          Mağaza aç
        </Link>
      </p>
    </form>
  );
}
