'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox, Loader2, Plus, RefreshCw, Search } from 'lucide-react';
import {
  listTickets,
  ticketPriorities,
  ticketReasons,
  ticketStatuses,
  type TicketList as TicketListResponse,
} from '../../lib/tickets-api';
import { formatDateTime } from '../../lib/display-format';
import { ApiClientError } from '../../lib/api-client';

export function TicketList({ admin = false }: { admin?: boolean }) {
  const [result, setResult] = useState<TicketListResponse | null>(null);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const base = admin ? '/admin/tickets' : '/seller/tickets';
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    listTickets(admin, { page, q: query, status, reason, priority })
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((error) => {
        if (active)
          setError(error instanceof ApiClientError ? error.message : 'Müraciətlər yüklənmədi.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [admin, page, query, status, reason, priority, revision]);
  function submit(event: FormEvent) {
    event.preventDefault();
    setQuery(search.trim());
    setPage(1);
  }

  return (
    <section className={`${admin ? 'admin-page' : 'seller-page'} tickets-page`}>
      <header className="tickets-heading">
        <div>
          <h2>Dəstək müraciətləri</h2>
          <span>{admin ? 'Mağazaların dəstək növbəsi' : 'Mağazanızın müraciətləri'}</span>
        </div>
        <div className="tickets-actions">
          <button
            className="button"
            aria-label="Müraciətləri yenilə"
            title="Müraciətləri yenilə"
            disabled={loading}
            onClick={() => setRevision((value) => value + 1)}
          >
            <RefreshCw size={17} />
          </button>
          {!admin ? (
            <Link className="button button-primary" href={`${base}/new`}>
              <Plus size={17} /> Yeni müraciət
            </Link>
          ) : (
            <Link className="button" href="/admin/reports">
              Moderasiya şikayətləri
            </Link>
          )}
        </div>
      </header>
      <div className="tickets-status-tabs" role="group" aria-label="Müraciət statusu">
        <button
          className={!status ? 'is-active' : ''}
          aria-pressed={!status}
          onClick={() => {
            setStatus('');
            setPage(1);
          }}
        >
          Hamısı{' '}
          <b>{Object.values(result?.meta.counts ?? {}).reduce((sum, value) => sum + value, 0)}</b>
        </button>
        {Object.entries(ticketStatuses).map(([key, label]) => (
          <button
            key={key}
            className={status === key ? 'is-active' : ''}
            aria-pressed={status === key}
            onClick={() => {
              setStatus(key);
              setPage(1);
            }}
          >
            {label} <b>{result?.meta.counts[key as keyof typeof ticketStatuses] ?? 0}</b>
          </button>
        ))}
      </div>
      <form className="tickets-filters" onSubmit={submit}>
        <label className="tickets-search">
          <Search size={17} />
          <input
            aria-label="Mövzu, mağaza və ya müraciət nömrəsi"
            placeholder="Mövzu, mağaza və ya #nömrə"
            maxLength={200}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          aria-label="Açılma səbəbi"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Bütün səbəblər</option>
          {Object.entries(ticketReasons).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Prioritet"
          value={priority}
          onChange={(event) => {
            setPriority(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Bütün prioritetlər</option>
          {Object.entries(ticketPriorities).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <button className="button" type="submit">
          <Search size={16} /> Axtar
        </button>
      </form>
      {error ? (
        <div className="form-alert form-alert-error" role="alert">
          {error}
        </div>
      ) : null}
      <div className="tickets-list" aria-busy={loading}>
        {loading ? (
          <div className="tickets-empty" role="status">
            <Loader2 className="spin-icon" size={24} /> Müraciətlər yüklənir...
          </div>
        ) : !result?.data.length ? (
          <div className="tickets-empty">
            <Inbox size={28} />
            <strong>Müraciət tapılmadı</strong>
            {query || status || reason || priority ? (
              <button
                className="button"
                onClick={() => {
                  setQuery('');
                  setSearch('');
                  setStatus('');
                  setReason('');
                  setPriority('');
                  setPage(1);
                }}
              >
                Filtrləri təmizlə
              </button>
            ) : !admin ? (
              <Link href={`${base}/new`}>Yeni müraciət aç</Link>
            ) : null}
          </div>
        ) : (
          result.data.map((ticket) => (
            <Link className="ticket-list-row" href={`${base}/${ticket.id}`} key={ticket.id}>
              <div className="ticket-row-subject">
                <small>
                  #{ticket.number} · {ticketReasons[ticket.reason]}
                </small>
                <strong>{ticket.subject}</strong>
                <span>{ticket.store.name}</span>
              </div>
              <span className={`ticket-priority is-${ticket.priority.toLowerCase()}`}>
                {ticketPriorities[ticket.priority]}
              </span>
              <span className={`ticket-status is-${ticket.status.toLowerCase()}`}>
                {ticketStatuses[ticket.status]}
              </span>
              <div className="ticket-row-date">
                <time dateTime={ticket.updatedAt}>{formatDateTime(ticket.updatedAt)}</time>
                <small>{ticket._count.messages} qeyd</small>
              </div>
              <ChevronRight size={18} />
            </Link>
          ))
        )}
      </div>
      {result && result.meta.totalPages > 1 ? (
        <nav className="tickets-pagination" aria-label="Müraciət səhifələri">
          <button
            className="button"
            aria-label="Əvvəlki səhifə"
            disabled={page <= 1 || loading}
            onClick={() => setPage((value) => value - 1)}
          >
            <ChevronLeft size={17} />
          </button>
          <span>
            {page} / {result.meta.totalPages}
          </span>
          <button
            className="button"
            aria-label="Növbəti səhifə"
            disabled={page >= result.meta.totalPages || loading}
            onClick={() => setPage((value) => value + 1)}
          >
            <ChevronRight size={17} />
          </button>
        </nav>
      ) : null}
    </section>
  );
}
