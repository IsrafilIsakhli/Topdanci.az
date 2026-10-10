'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Check, Loader2, LockKeyhole, RefreshCw, Send, UserCheck } from 'lucide-react';
import {
  getOlderTicketMessages,
  getTicket,
  replyToTicket,
  ticketPriorities,
  ticketReasons,
  ticketStatuses,
  updateTicket,
  type TicketDetail as TicketDetailResponse,
  type TicketMessage,
  type TicketPriority,
  type TicketStatus,
  type TicketUpdate,
} from '../../lib/tickets-api';
import { ApiClientError } from '../../lib/api-client';
import { formatDateTime } from '../../lib/display-format';
import { useAdminUser } from '../../app/admin/admin-shell';

function mergeMessages(current: TicketMessage[], incoming: TicketMessage[]) {
  return [
    ...new Map([...current, ...incoming].map((message) => [message.id, message])).values(),
  ].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

export function TicketDetail({ id, admin = false }: { id: string; admin?: boolean }) {
  const adminUser = useAdminUser();
  const [result, setResult] = useState<TicketDetailResponse | null>(null);
  const [olderCursor, setOlderCursor] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [working, setWorking] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionStatus, setActionStatus] = useState<TicketStatus | ''>('');
  const [actionNote, setActionNote] = useState('');
  const [unavailable, setUnavailable] = useState(false);
  const ticket = result?.data;
  const base = admin ? '/admin/tickets' : '/seller/tickets';
  const accept = useCallback((response: TicketDetailResponse) => {
    setResult((current) => {
      if (current && current.data.version > response.data.version) return current;
      return {
        ...response,
        data: {
          ...response.data,
          messages: mergeMessages(current?.data.messages ?? [], response.data.messages),
        },
      };
    });
  }, []);
  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await getTicket(admin, id);
      accept(response);
      setUnavailable(false);
      setError('');
    } catch (error) {
      setError(error instanceof ApiClientError ? error.message : 'Yazışma yüklənmədi.');
    } finally {
      setRefreshing(false);
    }
  }, [accept, admin, id]);

  useEffect(() => {
    let active = true;
    getTicket(admin, id)
      .then((response) => {
        if (active) {
          accept(response);
          setOlderCursor(response.meta.nextCursor);
        }
      })
      .catch((error) => {
        if (active) {
          setError(error instanceof ApiClientError ? error.message : 'Müraciət yüklənmədi.');
          setUnavailable(true);
        }
      });
    const timer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      getTicket(admin, id)
        .then((response) => {
          if (active) accept(response);
        })
        .catch(() => undefined);
    }, 20000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [accept, admin, id]);

  async function reply(event: FormEvent) {
    event.preventDefault();
    if (!ticket || working || draft.trim().length < 2) return;
    setWorking(true);
    setError('');
    setNotice('');
    try {
      accept(await replyToTicket(admin, id, draft.trim(), ticket.version));
      setDraft('');
      setNotice('Cavab göndərildi.');
    } catch (error) {
      setError(
        error instanceof ApiClientError
          ? error.message
          : 'Cavab göndərilmədi. Yazdığınız mətn saxlanılıb.',
      );
    } finally {
      setWorking(false);
    }
  }
  async function change(payload: Omit<TicketUpdate, 'version'>) {
    if (!ticket || working) return;
    setWorking(true);
    setError('');
    setNotice('');
    try {
      accept(await updateTicket(admin, id, { ...payload, version: ticket.version }));
      setActionStatus('');
      setActionNote('');
      setNotice('Müraciət yeniləndi.');
    } catch (error) {
      setError(error instanceof ApiClientError ? error.message : 'Dəyişiklik saxlanılmadı.');
    } finally {
      setWorking(false);
    }
  }
  async function older() {
    if (!olderCursor || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const response = await getOlderTicketMessages(admin, id, olderCursor);
      setResult((current) =>
        current
          ? {
              ...current,
              data: {
                ...current.data,
                messages: mergeMessages(response.data, current.data.messages),
              },
            }
          : current,
      );
      setOlderCursor(response.meta.nextCursor);
    } catch {
      setError('Əvvəlki qeydlər yüklənmədi. Təkrar cəhd edin.');
    } finally {
      setLoadingOlder(false);
    }
  }
  return (
    <section className={`${admin ? 'admin-page' : 'seller-page'} tickets-page`}>
      <Link className="tickets-back" href={base}>
        <ArrowLeft size={16} /> Müraciətlər
      </Link>
      {error ? (
        <div className="form-alert form-alert-error" role="alert">
          {error}{' '}
          <button className="button" onClick={() => void reload()} disabled={refreshing}>
            <RefreshCw size={15} /> Yenilə
          </button>
        </div>
      ) : null}
      {notice ? (
        <div className="form-alert form-alert-success" role="status">
          <Check size={16} />
          {notice}
        </div>
      ) : null}
      {!ticket ? (
        unavailable ? null : (
          <div className="tickets-empty" role="status">
            <Loader2 className="spin-icon" /> Müraciət yüklənir...
          </div>
        )
      ) : (
        <>
          <header className="tickets-heading">
            <div>
              <span>
                #{ticket.number} · {ticketReasons[ticket.reason]}
              </span>
              <h2>{ticket.subject}</h2>
            </div>
            <button
              className="button"
              aria-label="Yazışmanı yenilə"
              title="Yazışmanı yenilə"
              onClick={() => void reload()}
              disabled={refreshing || working}
            >
              <RefreshCw size={17} />
            </button>
          </header>
          <div className="ticket-detail-layout">
            <div className="ticket-conversation">
              <div className="ticket-thread">
                {olderCursor ? (
                  <button
                    className="button ticket-older"
                    disabled={loadingOlder}
                    onClick={() => void older()}
                  >
                    {loadingOlder ? 'Yüklənir...' : 'Əvvəlki qeydləri göstər'}
                  </button>
                ) : null}
                {ticket.messages.map((message) =>
                  message.kind === 'SYSTEM' ? (
                    <article key={message.id} className="ticket-system-event">
                      <time dateTime={message.createdAt}>{formatDateTime(message.createdAt)}</time>
                      <p>{message.body}</p>
                    </article>
                  ) : (
                    <article
                      key={message.id}
                      className={`ticket-message ${message.authorRole === 'SUPER_ADMIN' ? 'is-support' : ''}`}
                    >
                      <header>
                        <strong>
                          {message.authorRole === 'SUPER_ADMIN'
                            ? 'Dəstək komandası'
                            : message.author?.fullName || 'Mağaza nümayəndəsi'}
                        </strong>
                        <time dateTime={message.createdAt}>
                          {formatDateTime(message.createdAt)}
                        </time>
                      </header>
                      <p>{message.body}</p>
                    </article>
                  ),
                )}
              </div>
              {ticket.status === 'CLOSED' ? (
                <div className="ticket-closed-note">
                  <LockKeyhole size={18} />
                  <strong>Müraciət bağlıdır</strong>
                </div>
              ) : (
                <form className="ticket-composer" onSubmit={reply}>
                  <label htmlFor="ticket-reply">Cavabınız</label>
                  <textarea
                    id="ticket-reply"
                    rows={5}
                    minLength={2}
                    maxLength={5000}
                    required
                    value={draft}
                    disabled={working}
                    onChange={(event) => setDraft(event.target.value)}
                  />
                  <div>
                    <small>{draft.length} / 5000</small>
                    <button
                      className="button button-primary"
                      type="submit"
                      disabled={working || draft.trim().length < 2}
                    >
                      {working ? <Loader2 className="spin-icon" size={16} /> : <Send size={16} />}{' '}
                      Cavabı göndər
                    </button>
                  </div>
                </form>
              )}
            </div>
            <aside className="ticket-details">
              <h3>Müraciət məlumatları</h3>
              <dl>
                <dt>Status</dt>
                <dd>
                  <span className={`ticket-status is-${ticket.status.toLowerCase()}`}>
                    {ticketStatuses[ticket.status]}
                  </span>
                </dd>
                <dt>Açılma səbəbi</dt>
                <dd>{ticketReasons[ticket.reason]}</dd>
                <dt>Mağaza</dt>
                <dd>{ticket.store.name}</dd>
                <dt>Prioritet</dt>
                <dd>
                  {admin ? (
                    <select
                      aria-label="Müraciətin prioriteti"
                      value={ticket.priority}
                      disabled={working}
                      onChange={(event) =>
                        void change({ priority: event.target.value as TicketPriority })
                      }
                    >
                      {Object.entries(ticketPriorities).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  ) : (
                    ticketPriorities[ticket.priority]
                  )}
                </dd>
                <dt>Məsul şəxs</dt>
                <dd>
                  {ticket.assignee ? ticket.assignee.fullName || 'Superadmin' : 'Təyin edilməyib'}
                </dd>
                <dt>Açılma tarixi</dt>
                <dd>{formatDateTime(ticket.createdAt)}</dd>
                <dt>Son yenilənmə</dt>
                <dd>{formatDateTime(ticket.updatedAt)}</dd>
                {ticket.closedAt ? (
                  <>
                    <dt>Bağlanma tarixi</dt>
                    <dd>{formatDateTime(ticket.closedAt)}</dd>
                  </>
                ) : null}
              </dl>
              {admin ? (
                <button
                  className="button"
                  disabled={working || Boolean(ticket.assigneeId)}
                  onClick={() => void change({ claim: true })}
                >
                  <UserCheck size={16} /> Üzərimə götür
                </button>
              ) : null}
              {admin && ticket.assigneeId === adminUser?.id ? (
                <button
                  className="button"
                  disabled={working}
                  onClick={() => void change({ claim: false })}
                >
                  Ümumi növbəyə qaytar
                </button>
              ) : null}
              <form
                className="ticket-status-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (actionStatus)
                    void change({
                      status: actionStatus,
                      ...(actionNote.trim() ? { message: actionNote.trim() } : {}),
                    });
                }}
              >
                <label>
                  Statusu dəyiş
                  <select
                    value={actionStatus}
                    onChange={(event) => setActionStatus(event.target.value as TicketStatus)}
                    disabled={working}
                    required
                  >
                    <option value="">Status seçin</option>
                    {Object.entries(ticketStatuses)
                      .filter(
                        ([key]) =>
                          key !== ticket.status &&
                          (admin ||
                            key === 'CLOSED' ||
                            (ticket.status === 'CLOSED' && key === 'OPEN')),
                      )
                      .map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                  </select>
                </label>
                {actionStatus ? (
                  <>
                    <label>
                      {actionStatus === 'CLOSED' ? 'Bağlanma səbəbi' : 'Qeyd'}
                      <textarea
                        rows={3}
                        minLength={5}
                        maxLength={5000}
                        required={actionStatus === 'CLOSED'}
                        value={actionNote}
                        onChange={(event) => setActionNote(event.target.value)}
                        disabled={working}
                      />
                    </label>
                    <button
                      className={`button ${actionStatus === 'CLOSED' ? 'ticket-close-button' : 'button-primary'}`}
                      disabled={working}
                      type="submit"
                    >
                      <Check size={16} />{' '}
                      {actionStatus === 'CLOSED' ? 'Müraciəti bağla' : 'Statusu yadda saxla'}
                    </button>
                  </>
                ) : null}
              </form>
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
