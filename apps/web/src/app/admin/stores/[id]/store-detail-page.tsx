'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAdminStore, reactivateAdminStore, suspendAdminStore, type AdminStore } from '../../../../lib/admin-api';
import {
  AdminErrorBlock,
  AdminListLink,
  AdminLoadingBlock,
  AdminMetricCard,
  AdminPageHeader,
  AdminStatusBadge,
  errorMessage,
  formatDate,
} from '../../admin-ui';

export function AdminStoreDetailPage({ id }: { id: string }) {
  const [store, setStore] = useState<AdminStore | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    setIsLoading(true);
    try {
      const response = await getAdminStore(id);
      setStore(response.data);
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function run(action: 'suspend' | 'reactivate') {
    if (!store) return;
    const note = action === 'suspend' ? window.prompt('Dayandırma səbəbini yazın:') : undefined;
    if (action === 'suspend' && !note?.trim()) return;
    setIsBusy(true);
    setMessage(null);
    try {
      const response = action === 'suspend' ? await suspendAdminStore(store.id, note?.trim()) : await reactivateAdminStore(store.id);
      setStore(response.data);
      setMessage('Mağaza statusu yeniləndi və public keş təmizləndi.');
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  if (isLoading) return <AdminLoadingBlock />;
  if (hasError || !store) return <AdminErrorBlock message="Mağaza tapılmadı və ya yüklənmədi." />;

  return (
    <section className="admin-page">
      <AdminPageHeader
        kicker="Mağaza profili"
        title={store.name}
        description={`${store.city}${store.district ? `, ${store.district}` : ''} · ${formatDate(store.createdAt)}`}
        action={<AdminStatusBadge status={store.status} />}
      />
      {message ? <div className="admin-alert">{message}</div> : null}

      <div className="admin-stat-grid">
        <AdminMetricCard label="Məhsullar" value={store.counts.products} />
        <AdminMetricCard label="Üzvlər" value={store.counts.members} />
        <AdminMetricCard label="Lead hadisəsi" value={store.counts.leadEvents} />
        <AdminMetricCard label="Şikayət" value={store.counts.reports} />
      </div>

      <div className="admin-two-column">
        <section className="admin-panel">
          <h3>Əsas məlumat</h3>
          <dl className="admin-detail-list">
            <div>
              <dt>Hüquqi ad</dt>
              <dd>{store.legalName ?? '-'}</dd>
            </div>
            <div>
              <dt>Əlaqə</dt>
              <dd>{store.phone ?? store.whatsappNumber ?? '-'}</dd>
            </div>
            <div>
              <dt>E-poçt</dt>
              <dd>{store.email ?? '-'}</dd>
            </div>
            <div>
              <dt>Sahib</dt>
              <dd>{store.ownerUser?.email ?? store.ownerUser?.phone ?? '-'}</dd>
            </div>
            <div>
              <dt>Mağaza keçidi</dt>
              <dd>
                <Link href={`/stores/${store.slug}`}>Mağazaya bax</Link>
              </dd>
            </div>
          </dl>
          <div className="admin-actions">
            <button className="button button-danger" type="button" disabled={isBusy || store.status === 'SUSPENDED'} onClick={() => void run('suspend')}>
              Dayandır
            </button>
            <button className="button" type="button" disabled={isBusy || store.status === 'ACTIVE'} onClick={() => void run('reactivate')}>
              Aktivləşdir
            </button>
          </div>
        </section>

        <section className="admin-panel">
          <h3>Son məhsullar</h3>
          <div className="admin-list">
            {store.products?.length ? (
              store.products.map((product) => (
                <AdminListLink
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  title={product.title}
                  meta={product.priceLabel}
                  badge={<AdminStatusBadge status={product.status} />}
                />
              ))
            ) : (
              <span className="admin-muted">Məhsul yoxdur.</span>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
