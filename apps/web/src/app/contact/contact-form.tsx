'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { apiPost } from '../../lib/api-client';

type SubmitState =
  | { type: 'idle' }
  | { type: 'submitting' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

const subjectOptions = ['Mağaza açmaq', 'Məhsul yerləşdirmək', 'Reklam və premium vitrin', 'Texniki problem', 'Digər müraciət'];

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
    <form className="contact-form-card contact-v2-form" onSubmit={handleSubmit}>
      <header className="contact-v2-form-header">
        <span className="form-kicker">
          <MessageSquare size={16} />
          Mesaj göndərin
        </span>
        <h2>Müraciətinizi yazın</h2>
        <p>Mövzunu seçin, komanda müraciətinizi doğru istiqamətdə cavablandırsın.</p>
      </header>

      {state.type === 'success' ? <p className="form-alert form-alert-success">{state.message}</p> : null}
      {state.type === 'error' ? <p className="form-alert form-alert-error">{state.message}</p> : null}

      <div className="field-grid">
        <label className="field">
          <span>Ad</span>
          <input autoComplete="name" name="name" placeholder="Adınız və soyadınız" required />
        </label>
        <label className="field">
          <span>E-poçt</span>
          <input autoComplete="email" name="email" placeholder="numune@email.com" required type="email" />
        </label>
        <label className="field">
          <span>Telefon</span>
          <input autoComplete="tel" inputMode="tel" name="phone" placeholder="+994 (__) ___-__-__" />
        </label>
        <label className="field">
          <span>Mövzu</span>
          <select name="subject" defaultValue="" required>
            <option disabled value="">
              Müraciət tipi seçin
            </option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>
        <label className="field field-full">
          <span>Mesaj</span>
          <textarea name="message" placeholder="Qısa və aydın şəkildə yazın" required />
        </label>
      </div>
      <button className="button button-primary button-full" disabled={state.type === 'submitting'} type="submit">
        <Send size={17} />
        {state.type === 'submitting' ? 'Göndərilir...' : 'Müraciəti göndər'}
      </button>
      <small className="contact-v2-form-note">Göndərməklə məlumatlarınızın müraciətinizə cavab vermək üçün işlənməsinə razılaşırsınız.</small>
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
