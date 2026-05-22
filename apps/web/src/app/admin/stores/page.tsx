'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getAdminStores, type AdminStore, type AdminStoreStatus } from '../../../lib/admin-api';
import { AdminEmptyBlock, AdminErrorBlock, AdminLoadingBlock, AdminPageHeader, AdminStatusBadge, compactNumber, formatDate } from '../admin-ui';

const statusOptions: Array<{ label: string; value: AdminStoreStatus | '' }> = [
  { label: 'Bütün mağazalar', value: '' },
  { label: 'Aktiv', value: 'ACTIVE' },
  { label: 'Gözləyən', value: 'PENDING' },
  { label: 'Suspend', value: 'SUSPENDED' },
  { label: 'Rədd edilmiş', value: 'REJECTED' },
];

export default function AdminStoresPage() {
  const [status, setStatus] = useState<AdminStoreStatus | ''>('');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<AdminStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const params = useMemo(() => ({ status: status || undefined, q: query.trim() || undefined, limit: '60' }), [query, status]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getAdminStores(params)
      .then((response) => {
        if (mounted) {
          setItems(response.data);
          setHasError(false);
        }
      })
      .catch(() => mounted && setHasError(true))
      .finally(() => mounted && setIsLoading(false));

    return () => {
      mounted = false;
    };
  }, [params]);

  return (
    <section className="admin-page">
      <AdminPageHeader
        kicker="Store Ops"
        title="Mağaza idarəsi"
        description="Aktiv, suspend və review prosesində olan mağazaları idarə edin."
      />
      <div className="admin-toolbar">
        <input className="admin-input" placeholder="Mağaza, slug, telefon və ya email axtarın" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="admin-select" value={status} onChange={(event) => setStatus(event.target.value as AdminStoreStatus | '')}>
          {statusOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <section className="admin-panel">
        {isLoading ? <AdminLoadingBlock /> : null}
        {hasError ? <AdminErrorBlock /> : null}
        {!isLoading && !hasError && !items.length ? <AdminEmptyBlock title="Mağaza tapılmadı" /> : null}
        {!isLoading && !hasError && items.length ? (
          <div className="admin-card-grid">
            {items.map((store) => (
              <Link className="admin-store-card" href={`/admin/stores/${store.id}`} key={store.id}>
                <span className="admin-avatar">{store.name.slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{store.name}</strong>
                  <small>{store.category?.name ?? 'Kateqoriya yoxdur'} · {store.city}</small>
                  <small>{compactNumber(store.counts.products)} məhsul · {formatDate(store.createdAt)}</small>
                </div>
                <AdminStatusBadge status={store.status} />
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}
