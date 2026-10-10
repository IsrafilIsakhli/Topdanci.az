'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { CheckCircle2, KeyRound, Loader2 } from 'lucide-react';
import { ApiClientError } from '../../../lib/api-client';
import { setupPassword } from '../../../lib/seller-api';

export function SetupPasswordForm() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!token) {
      setError('Aktivləşdirmə linki yanlışdır və ya token yoxdur.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifrələr eyni deyil.');
      return;
    }

    if (password.length < 8) {
      setError('Şifrə ən azı 8 simvol olmalıdır.');
      return;
    }

    setIsSubmitting(true);
    try {
      await setupPassword(token, password);
      setCompleted(true);
    } catch (caught) {
      if (caught instanceof ApiClientError && caught.status === 401) {
        setError('Aktivləşdirmə linki artıq istifadə olunub və ya vaxtı bitib.');
      } else if (caught instanceof ApiClientError && caught.status === 400) {
        setError('Şifrə təhlükəsizlik tələblərinə uyğun deyil.');
      } else {
        setError('Hesabı aktivləşdirmək mümkün olmadı. Bir az sonra yenidən yoxlayın.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (completed) {
    return (
      <div className="auth-card">
        <div className="form-success-icon">
          <CheckCircle2 size={28} />
        </div>
        <div>
          <h2>Hesab aktivləşdirildi</h2>
          <p className="card-meta">İndi yeni şifrənizlə mağaza panelinə daxil ola bilərsiniz.</p>
        </div>
        <Link className="button button-primary button-full" href="/login?next=/seller">
          Daxil ol
        </Link>
      </div>
    );
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <div>
        <h2>Şifrə yaradın</h2>
        <p className="card-meta">Bu link yalnız bir dəfə istifadə olunur. Güclü şifrə seçin.</p>
      </div>

      {error ? <div className="form-alert form-alert-error">{error}</div> : null}
      {!token ? <div className="form-alert form-alert-error">Aktivləşdirmə keçidi tapılmadı. Admin panelindəki quraşdırma keçidini yenidən açın.</div> : null}

      <div className="field-grid">
        <label className="field">
          <span>Yeni şifrə</span>
          <input
            type="password"
            value={password}
            placeholder="Minimum 8 simvol"
            autoComplete="new-password"
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Şifrəni təkrar yazın</span>
          <input
            type="password"
            value={confirmPassword}
            placeholder="Şifrəni təkrar edin"
            autoComplete="new-password"
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </label>
      </div>

      <button className="button button-primary button-full" type="submit" disabled={isSubmitting || !token}>
        {isSubmitting ? <Loader2 className="spin-icon" size={16} /> : <KeyRound size={16} />}
        Hesabı aktiv et
      </button>
      <p className="card-meta">
        Link işləmirsə, mağaza müraciətinizi təsdiqləyən adminlə əlaqə saxlayın.
      </p>
    </form>
  );
}
