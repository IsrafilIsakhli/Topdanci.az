'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { Send } from 'lucide-react';
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
    const formData = new FormData(event.currentTarget);

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
      event.currentTarget.reset();
      setState({
        type: 'success',
        message: 'Müraciətiniz qəbul edildi. Admin yoxlamasından sonra sizinlə əlaqə saxlanılacaq.',
      });
    } catch (error) {
      setState({ type: 'error', message: getErrorMessage(error) });
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>Mağaza müraciəti</h2>

      {state.type === 'success' ? <p className="form-alert form-alert-success">{state.message}</p> : null}
      {state.type === 'error' ? <p className="form-alert form-alert-error">{state.message}</p> : null}

      <div className="field-grid">
        <label className="field">
          <span>Ad və soyad</span>
          <input name="contactName" placeholder="Adınızı daxil edin" required />
        </label>
        <label className="field">
          <span>E-poçt</span>
          <input name="contactEmail" placeholder="numune@email.com" type="email" />
        </label>
        <label className="field">
          <span>Telefon</span>
          <input name="contactPhone" placeholder="+994 (__) ___-__-__" required />
        </label>
        <label className="field">
          <span>VÖEN</span>
          <input name="taxNumber" placeholder="VÖEN varsa daxil edin" />
        </label>
        <label className="field">
          <span>Mağaza adı</span>
          <input name="companyName" placeholder="Şirkət və ya mağaza adı" required />
        </label>
        <label className="field">
          <span>Əsas kateqoriya</span>
          <select name="categoryId">
            <option value="">Kateqoriya seçin</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Şəhər</span>
          <input name="city" placeholder="Bakı" required />
        </label>
        <label className="field">
          <span>Rayon</span>
          <input name="district" placeholder="Nəsimi" />
        </label>
        <label className="field field-full">
          <span>Qısa mağaza təsviri</span>
          <textarea name="description" placeholder="Mağazanız və məhsullarınız haqqında qısa məlumat" />
        </label>
      </div>

      <button className="button button-primary button-full" disabled={state.type === 'submitting'} type="submit">
        <Send size={17} />
        {state.type === 'submitting' ? 'Göndərilir...' : 'Müraciəti göndər'}
      </button>
      <p className="card-meta">
        Artıq hesabınız var?{' '}
        <Link className="card-link" href="/login">
          Daxil ol
        </Link>
      </p>
    </form>
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
