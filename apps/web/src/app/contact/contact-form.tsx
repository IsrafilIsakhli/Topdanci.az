'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { MessageSquare } from 'lucide-react';
import { apiPost } from '../../lib/api-client';

type SubmitState =
  | { type: 'idle' }
  | { type: 'submitting' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

export function ContactForm() {
  const [state, setState] = useState<SubmitState>({ type: 'idle' });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setState({ type: 'submitting' });

    try {
      await apiPost('/support/requests', {
        name: getValue(formData, 'name'),
        email: getValue(formData, 'email'),
        phone: getOptionalValue(formData, 'phone'),
        subject: getOptionalValue(formData, 'subject') ?? 'TopdanBazar dəstək müraciəti',
        message: getValue(formData, 'message'),
      });

      event.currentTarget.reset();
      setState({ type: 'success', message: 'Mesajınız qəbul edildi. Dəstək komandası ən qısa zamanda baxacaq.' });
    } catch {
      setState({ type: 'error', message: 'Mesaj göndərilə bilmədi. Bir az sonra yenidən cəhd edin.' });
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>Mesaj göndər</h2>

      {state.type === 'success' ? <p className="form-alert form-alert-success">{state.message}</p> : null}
      {state.type === 'error' ? <p className="form-alert form-alert-error">{state.message}</p> : null}

      <div className="field-grid">
        <label className="field">
          <span>Ad</span>
          <input name="name" placeholder="Adınız" required />
        </label>
        <label className="field">
          <span>E-poçt</span>
          <input name="email" placeholder="numune@email.com" required type="email" />
        </label>
        <label className="field">
          <span>Telefon</span>
          <input name="phone" placeholder="+994 (__) ___-__-__" />
        </label>
        <label className="field">
          <span>Mövzu</span>
          <input name="subject" placeholder="Müraciətin mövzusu" />
        </label>
        <label className="field field-full">
          <span>Mesaj</span>
          <textarea name="message" placeholder="Mesajınızı yazın" required />
        </label>
      </div>
      <button className="button button-primary button-full" disabled={state.type === 'submitting'} type="submit">
        <MessageSquare size={17} />
        {state.type === 'submitting' ? 'Göndərilir...' : 'Göndər'}
      </button>
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
