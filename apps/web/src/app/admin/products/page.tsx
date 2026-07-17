'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  bulkApproveAdminProducts,
  bulkRejectAdminProducts,
  flagAdminProduct,
  getAdminProducts,
  type AdminProduct,
  type AdminProductStatus,
} from '../../../lib/admin-api';
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reviewNote, setReviewNote] = useState('Məhsul məlumatları natamamdır.');
  const [isMutating, setIsMutating] = useState(false);
  const [feedback, setFeedback] = useState('');

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
          setSelectedIds([]);
          setHasError(false);
        }
      })
      .catch(() => mounted && setHasError(true))
      .finally(() => mounted && setIsLoading(false));

    return () => {
      mounted = false;
    };
  }, [params]);

  function toggleProduct(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleAll() {
    const selectable = items.filter((item) => item.status === 'PENDING_REVIEW').map((item) => item.id);
    setSelectedIds((current) => selectable.every((id) => current.includes(id)) ? [] : selectable);
  }

  async function runBulk(action: 'approve' | 'reject') {
    if (!selectedIds.length || isMutating) return;
    setIsMutating(true);
    setFeedback('');
    try {
      const response = action === 'approve'
        ? await bulkApproveAdminProducts(selectedIds)
        : await bulkRejectAdminProducts(selectedIds, reviewNote);
      setFeedback(`${response.meta.updated} məhsul yeniləndi${response.meta.skipped ? `, ${response.meta.skipped} keçildi` : ''}.`);
      const refreshed = await getAdminProducts(params);
      setItems(refreshed.data);
      setSelectedIds([]);
    } catch {
      setFeedback('Toplu əməliyyat tamamlanmadı. Statusları və rədd səbəbini yoxlayın.');
    } finally {
      setIsMutating(false);
    }
  }

  async function flagProduct(id: string) {
    setFeedback('');
    try {
      await flagAdminProduct(id, 'Şübhəli elan: əlavə yoxlama tələb olunur.');
      setItems((current) => current.map((item) => item.id === id ? { ...item, openReportCount: (item.openReportCount ?? 0) + 1 } : item));
      setFeedback('Məhsul şübhəli elan kimi işarələndi.');
    } catch {
      setFeedback('Məhsul artıq işarələnib və ya əməliyyat tamamlanmadı.');
    }
  }

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

      {selectedIds.length ? (
        <div className="admin-bulk-toolbar" role="region" aria-label="Toplu moderasiya">
          <strong>{selectedIds.length} məhsul seçilib</strong>
          <select aria-label="Rədd səbəbi" className="admin-select" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)}>
            <option value="Məhsul məlumatları natamamdır.">Məlumatlar natamamdır</option>
            <option value="Qiymət və minimum sifariş məlumatı dəqiqləşdirilməlidir.">Qiymət/sifariş dəqiqləşməlidir</option>
            <option value="Şəkillər keyfiyyət tələblərinə uyğun deyil.">Şəkillər uyğun deyil</option>
            <option value="Elan qaydalara uyğun deyil.">Elan qaydalara uyğun deyil</option>
          </select>
          <button className="button" disabled={isMutating} onClick={() => void runBulk('reject')} type="button">Seçilənləri rədd et</button>
          <button className="button button-primary" disabled={isMutating} onClick={() => void runBulk('approve')} type="button">Seçilənləri təsdiqlə</button>
        </div>
      ) : null}
      {feedback ? <p className="admin-action-feedback" role="status">{feedback}</p> : null}

      <AdminProductTable
        items={items}
        isLoading={isLoading}
        hasError={hasError}
        onFlag={(id) => void flagProduct(id)}
        onToggle={toggleProduct}
        onToggleAll={toggleAll}
        selectedIds={selectedIds}
      />
    </section>
  );
}
