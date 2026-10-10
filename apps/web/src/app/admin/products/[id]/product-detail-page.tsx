'use client';
import { statusLabel } from '../../../../lib/status-labels';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  approveAdminProduct,
  getAdminProduct,
  rejectAdminProduct,
  suspendAdminProduct,
  type AdminProduct,
} from '../../../../lib/admin-api';
import { AdminErrorBlock, AdminLoadingBlock, AdminMetricCard, AdminPageHeader, AdminStatusBadge, errorMessage, formatDate } from '../../admin-ui';

export function AdminProductDetailPage({ id }: { id: string }) {
  const [product, setProduct] = useState<AdminProduct | null>(null);
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
      const response = await getAdminProduct(id);
      setProduct(response.data);
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function runAction(action: 'approve' | 'reject' | 'suspend') {
    if (!product) return;
    const note =
      action === 'approve'
        ? undefined
        : window.prompt(action === 'reject' ? 'Rədd səbəbini yazın:' : 'Dayandırma səbəbini yazın:');
    if (action !== 'approve' && !note?.trim()) return;

    setIsBusy(true);
    setMessage(null);
    try {
      const response =
        action === 'approve'
          ? await approveAdminProduct(product.id)
          : action === 'reject'
            ? await rejectAdminProduct(product.id, note!.trim())
            : await suspendAdminProduct(product.id, note?.trim());
      setProduct(response.data);
      setMessage('Məhsulun statusu yeniləndi.');
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  if (isLoading) return <AdminLoadingBlock />;
  if (hasError || !product) return <AdminErrorBlock message="Məhsul tapılmadı və ya yüklənmədi." />;

  const readyImage = product.images?.find((image) => image.status === 'READY' && image.cdnUrl);

  return (
    <section className="admin-page">
      <AdminPageHeader
        kicker="Məhsul detalları"
        title={product.title}
        description={`${product.store.name} · ${product.category?.name ?? 'Kateqoriya yoxdur'} · ${formatDate(product.updatedAt)}`}
        action={<AdminStatusBadge status={product.status} />}
      />
      {message ? <div className="admin-alert">{message}</div> : null}

      <div className="admin-detail-grid">
        <section className="admin-panel admin-product-preview">
          <div className="admin-image-frame">
            {readyImage?.cdnUrl ? (
              <Image src={readyImage.cdnUrl} alt={readyImage.altText ?? product.title} fill sizes="(max-width: 800px) 100vw, 48vw" />
            ) : (
              <span>Məhsul şəkli əlavə edilməyib</span>
            )}
          </div>
          <div className="admin-actions">
            <button className="button button-primary" title={product.status === 'ACTIVE' ? 'Məhsul artıq aktivdir' : 'Məhsulu kataloqda yayımla'} type="button" disabled={isBusy || product.status === 'ACTIVE'} onClick={() => void runAction('approve')}>
              Təsdiqlə
            </button>
            <button className="button button-secondary" type="button" disabled={isBusy} onClick={() => void runAction('reject')}>
              Rədd et
            </button>
            <button className="button button-danger" type="button" disabled={isBusy || product.status === 'PASSIVE'} onClick={() => void runAction('suspend')}>
              Dayandır
            </button>
          </div>
        </section>

        <section className="admin-panel">
          <h3>Əsas məlumat</h3>
          <dl className="admin-detail-list">
            <div>
              <dt>Qiymət</dt>
              <dd>{product.priceLabel}</dd>
            </div>
            <div>
              <dt>Minimum sifariş</dt>
              <dd>{product.minOrderQuantity ?? '-'}</dd>
            </div>
            <div>
              <dt>Stok</dt>
              <dd>{statusLabel(product.stockStatus)}</dd>
            </div>
            <div>
              <dt>Yoxlama qeydi</dt>
              <dd>{product.reviewNote ?? '-'}</dd>
            </div>
            <div>
              <dt>Kataloq keçidi</dt>
              <dd>
                <Link href={`/products/${product.slug}`}>Məhsula bax</Link>
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="admin-stat-grid">
        <AdminMetricCard label="Baxış" value={product.leadCounts?.PRODUCT_VIEW ?? 0} />
        <AdminMetricCard label="Mağaza baxışı" value={product.leadCounts?.STORE_VIEW ?? 0} />
        <AdminMetricCard label="WhatsApp" value={product.leadCounts?.WHATSAPP_CLICK ?? 0} />
        <AdminMetricCard label="Telefon" value={product.leadCounts?.PHONE_REVEAL ?? 0} />
      </div>

      <section className="admin-panel">
        <h3>Açıqlama</h3>
        <p className="admin-long-text">{product.description ?? 'Açıqlama əlavə edilməyib.'}</p>
      </section>
    </section>
  );
}
