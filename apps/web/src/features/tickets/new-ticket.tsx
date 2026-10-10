'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import {
  createTicket,
  ticketPriorities,
  ticketReasons,
  type TicketPriority,
  type TicketReason,
} from '../../lib/tickets-api';
import { getSellerStores, type SellerStore } from '../../lib/seller-api';
import { ApiClientError } from '../../lib/api-client';

export function NewTicket() {
  const router = useRouter();
  const [stores, setStores] = useState<SellerStore[]>([]);
  const [storeId, setStoreId] = useState('');
  const [subject, setSubject] = useState('');
  const [reason, setReason] = useState<TicketReason | ''>('');
  const [priority, setPriority] = useState<TicketPriority>('NORMAL');
  const [message, setMessage] = useState('');
  const [working, setWorking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    getSellerStores()
      .then((response) => {
        if (active) {
          setStores(response.data);
          setStoreId(response.data[0]?.id ?? '');
        }
      })
      .catch(() => {
        if (active) setError('Mağazalar yüklənmədi. Səhifəni yenidən açın.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!reason || !storeId || working) return;
    if (subject.trim().length < 5 || message.trim().length < 10) {
      setError('Mövzu ən az 5, izah ən az 10 simvol olmalıdır.');
      return;
    }
    setWorking(true);
    setError('');
    try {
      const result = await createTicket({
        storeId,
        subject: subject.trim(),
        reason,
        priority,
        message: message.trim(),
      });
      router.push(`/seller/tickets/${result.data.id}`);
    } catch (error) {
      setError(error instanceof ApiClientError ? error.message : 'Müraciət göndərilmədi.');
      setWorking(false);
    }
  }
  return (
    <section className="seller-page tickets-page">
      <Link className="tickets-back" href="/seller/tickets">
        <ArrowLeft size={16} /> Müraciətlər
      </Link>
      <header className="tickets-heading">
        <h2>Yeni dəstək müraciəti</h2>
      </header>
      {error ? (
        <div role="alert" className="form-alert form-alert-error">
          {error}
        </div>
      ) : null}
      {loading ? (
        <div className="tickets-empty" role="status">
          <Loader2 className="spin-icon" /> Mağazalar yüklənir...
        </div>
      ) : !stores.length ? (
        <div className="tickets-empty">Bu hesab üçün mağaza tapılmadı.</div>
      ) : (
        <form className="ticket-create-form" onSubmit={submit}>
          <div className="ticket-form-grid">
            <label>
              Mağaza
              <select
                value={storeId}
                onChange={(event) => setStoreId(event.target.value)}
                required
                disabled={working}
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Açılma səbəbi
              <select
                value={reason}
                onChange={(event) => setReason(event.target.value as TicketReason)}
                required
                disabled={working}
              >
                <option value="">Səbəb seçin</option>
                {Object.entries(ticketReasons).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="is-wide">
              Mövzu
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                minLength={5}
                maxLength={200}
                required
                disabled={working}
                placeholder="Məsələn: məhsulun yoxlanması ilə bağlı problem"
              />
            </label>
            <label>
              Prioritet
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as TicketPriority)}
                disabled={working}
              >
                {Object.entries(ticketPriorities).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="is-wide">
              Problemin izahı
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                minLength={10}
                maxLength={5000}
                rows={7}
                required
                disabled={working}
                placeholder="Nə baş verib, hansı səhifədə və nə vaxt?"
              />
              <small>{message.length} / 5000</small>
            </label>
          </div>
          <div className="tickets-actions">
            <Link className="button" href="/seller/tickets">
              Ləğv et
            </Link>
            <button className="button button-primary" disabled={working} type="submit">
              {working ? <Loader2 className="spin-icon" size={17} /> : <Send size={17} />}{' '}
              {working ? 'Göndərilir...' : 'Müraciəti aç'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
