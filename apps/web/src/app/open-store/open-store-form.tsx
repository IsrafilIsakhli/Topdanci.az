'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Store } from 'lucide-react';
import { ApiClientError, apiPost } from '../../lib/api-client';

type CategoryOption = {
  id: string;
  name: string;
};

type OpenStoreFormProps = {
  categories: CategoryOption[];
};

type SubmitState =
  | { type: 'idle' }
  | { type: 'submitting' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

export function OpenStoreForm({ categories }: OpenStoreFormProps) {
  const [state, setState] = useState<SubmitState>({ type: 'idle' });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setState({ type: 'submitting' });

    try {
      const payload = {
        contactName: getValue(formData, 'contactName'),
        contactPhone: getValue(formData, 'contactPhone'),
        contactEmail: getOptionalValue(formData, 'contactEmail'),
        companyName: getValue(formData, 'companyName'),
        taxNumber: getOptionalValue(formData, 'taxNumber'),
        categoryId: getOptionalValue(formData, 'categoryId'),
        city: getValue(formData, 'city'),
        district: getOptionalValue(formData, 'district'),
        description: getOptionalValue(formData, 'description'),
      };

      await apiPost('/stores/applications', payload);
      form.reset();
      setState({
        type: 'success',
        message: 'Müraciətiniz qəbul edildi. Admin yoxlamasından sonra sizinlə əlaqə saxlanılacaq.',
      });
    } catch (error) {
      setState({ type: 'error', message: getErrorMessage(error) });
    }
  }

  return (
    <div className="authx-wrap authx-wrap-wide">
      <Link className="authx-brand" href="/">
        <span className="authx-brand-mark" aria-hidden="true">
          <Store size={22} />
        </span>
        <span className="authx-brand-name">TopdanBazar</span>
      </Link>

      <form className="authx-card" onSubmit={handleSubmit}>
        <header className="authx-card-head">
          <h1>Mağaza açın</h1>
          <p>Mağaza və əlaqə məlumatlarınızı göndərin.</p>
        </header>

        {state.type === 'success' ? <p className="authx-alert authx-alert-success" role="status">{state.message}</p> : null}
        {state.type === 'error' ? <p className="authx-alert authx-alert-error" role="alert">{state.message}</p> : null}

        <section className="authx-section">
          <header className="authx-section-head">
            <b>01</b>
            <h3>Əlaqə məlumatları</h3>
            <span>Yoxlama üçün lazımdır</span>
          </header>
          <div className="authx-grid-2">
            <label className="authx-field">
              <span>Ad və soyad</span>
              <input name="contactName" placeholder="Adınızı daxil edin" autoComplete="name" required />
            </label>
            <label className="authx-field">
              <span>Telefon</span>
              <input name="contactPhone" placeholder="+994 (__) ___-__-__" autoComplete="tel" inputMode="tel" required />
            </label>
            <label className="authx-field">
              <span>E-poçt (könüllü)</span>
              <input name="contactEmail" placeholder="numune@email.com" type="email" autoComplete="email" />
            </label>
            <label className="authx-field">
              <span>VÖEN (könüllü)</span>
              <input name="taxNumber" placeholder="VÖEN varsa daxil edin" />
            </label>
          </div>
        </section>

        <section className="authx-section">
          <header className="authx-section-head">
            <b>02</b>
            <h3>Mağaza məlumatları</h3>
            <span>Vitrində görünəcək</span>
          </header>
          <div className="authx-grid-2">
            <label className="authx-field">
              <span>Mağaza adı</span>
              <input name="companyName" placeholder="Şirkət və ya mağaza adı" required />
            </label>
            <label className="authx-field">
              <span>Əsas kateqoriya (könüllü)</span>
              <select name="categoryId">
                <option value="">Kateqoriya seçin</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="authx-field">
              <span>Şəhər</span>
              <input name="city" placeholder="Bakı" autoComplete="address-level2" required />
            </label>
            <label className="authx-field">
              <span>Rayon (könüllü)</span>
              <input name="district" placeholder="Nəsimi" />
            </label>
            <label className="authx-field authx-field-full">
              <span>Qısa mağaza təsviri (könüllü)</span>
              <textarea name="description" placeholder="Mağazanız və məhsullarınız haqqında qısa məlumat" />
            </label>
          </div>
        </section>

        <button className="authx-submit" disabled={state.type === 'submitting'} type="submit">
          <span>{state.type === 'submitting' ? 'Göndərilir…' : 'Müraciəti göndər'}</span>
          <ArrowRight size={17} />
        </button>
      </form>

      <p className="authx-alt">
        Artıq hesabınız var? <Link href="/login">Daxil olun</Link>
      </p>
    </div>
  );
}

function getValue(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function getOptionalValue(formData: FormData, key: string): string | undefined {
  const value = getValue(formData, key);
  return value || undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError && error.status === 409) {
    return 'Bu mağaza müraciəti artıq mövcud ola bilər. Məlumatları yoxlayın və ya dəstəyə yazın.';
  }

  return 'Müraciət göndərilə bilmədi. Bir az sonra yenidən cəhd edin.';
}
