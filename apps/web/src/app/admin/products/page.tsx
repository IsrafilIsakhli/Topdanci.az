'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getAdminProducts, type AdminProduct, type AdminProductStatus } from '../../../lib/admin-api';
import { AdminPageHeader } from '../admin-ui';
import { AdminProductTable } from './product-table';

const statusOptions: Array<{ label: string; value: AdminProductStatus | '' }> = [
  { label: 'Bütün statuslar', value: '' },
  { label: 'Review gözləyən', value: 'PENDING_REVIEW' },
  { label: 'Aktiv', value: 'ACTIVE' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Passiv', value: 'PASSIVE' },
  { label: 'Rədd edilmiş', value: 'REJECTED' },
  { label: 'Silinmiş', value: 'DELETED' },
];

export default function AdminProductsPage() {
  const [status, setStatus] = useState<AdminProductStatus | ''>('');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const params = useMemo(
    () => ({
      status: status || undefined,
      q: query.trim() || undefined,
      limit: '60',
    }),
    [query, status],
  );

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    getAdminProducts(params)
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
        kicker="Catalog Ops"
        title="Məhsul moderasiyası"
        description="Bütün məhsulları status, mağaza və axtarış üzrə izləyin."
        action={<Link className="button" href="/admin/products/pending">Pending review</Link>}
      />

      <div className="admin-toolbar">
        <input className="admin-input" placeholder="Məhsul, açıqlama və ya mağaza axtarın" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="admin-select" value={status} onChange={(event) => setStatus(event.target.value as AdminProductStatus | '')}>
          {statusOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <AdminProductTable items={items} isLoading={isLoading} hasError={hasError} />
    </section>
  );
}
