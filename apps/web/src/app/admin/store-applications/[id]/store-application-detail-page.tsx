'use client';

import { useEffect, useState } from 'react';
import {
  approveStoreApplication,
  getStoreApplication,
  rejectStoreApplication,
  type AdminStoreApplication,
} from '../../../../lib/admin-api';
import { AdminErrorBlock, AdminLoadingBlock, AdminPageHeader, AdminStatusBadge, errorMessage, formatDate } from '../../admin-ui';

export function StoreApplicationDetailPage({ id }: { id: string }) {
  const [application, setApplication] = useState<AdminStoreApplication | null>(null);
  const [setupUrl, setSetupUrl] = useState<string | null>(null);
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
      const response = await getStoreApplication(id);
      setApplication(response.data);
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove() {
    if (!application || application.status !== 'PENDING') return;
    const reviewNote = window.prompt('Təsdiq qeydi əlavə edin (istəyə bağlı):') ?? undefined;
    const storeSlug = window.prompt('Mağaza slug yazın (boş buraxsanız avtomatik yaradılacaq):') ?? undefined;
    setIsBusy(true);
    setMessage(null);
    try {
      const response = await approveStoreApplication(application.id, {
        ...(reviewNote ? { reviewNote } : {}),
        ...(storeSlug ? { storeSlug } : {}),
      });
      setSetupUrl(response.data.setup.url);
      setMessage('Müraciət təsdiqləndi. Setup link yalnız bu cavabda göstərilir.');
      await load();
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleReject() {
    if (!application || application.status !== 'PENDING') return;
    const reviewNote = window.prompt('Rədd səbəbini yazın:');
    if (!reviewNote?.trim()) return;
    setIsBusy(true);
    setMessage(null);
    try {
      const response = await rejectStoreApplication(application.id, reviewNote.trim());
      setApplication(response.data);
      setMessage('Müraciət rədd edildi.');
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  async function copySetupUrl() {
    if (!setupUrl) return;
    await navigator.clipboard.writeText(setupUrl).catch(() => null);
    setMessage('Setup link kopyalandı.');
  }

  if (isLoading) return <AdminLoadingBlock />;
  if (hasError || !application) return <AdminErrorBlock message="Müraciət tapılmadı və ya yüklənmədi." />;

  return (
    <section className="admin-page">
      <AdminPageHeader
        kicker="Mağaza müraciəti"
        title={application.companyName}
        description={`${application.city}${application.district ? `, ${application.district}` : ''} · ${formatDate(application.createdAt)}`}
        action={<AdminStatusBadge status={application.status} />}
      />

      {message ? <div className="admin-alert">{message}</div> : null}
      {setupUrl ? (
        <div className="admin-alert admin-alert-success">
          <strong>Seller setup linki:</strong>
          <code>{setupUrl}</code>
          <button className="button" type="button" onClick={() => void copySetupUrl()}>
            Copy
          </button>
        </div>
      ) : null}

      <div className="admin-two-column">
        <section className="admin-panel">
          <h3>Şirkət məlumatları</h3>
          <dl className="admin-detail-list">
            <div>
              <dt>Şirkət adı</dt>
              <dd>{application.companyName}</dd>
            </div>
            <div>
              <dt>VÖEN</dt>
              <dd>{application.taxNumber ?? '-'}</dd>
            </div>
            <div>
              <dt>Açıqlama</dt>
              <dd>{application.description ?? '-'}</dd>
            </div>
            <div>
              <dt>Review qeydi</dt>
              <dd>{application.reviewNote ?? '-'}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-panel">
          <h3>Əlaqə və əməliyyat</h3>
          <dl className="admin-detail-list">
            <div>
              <dt>Əlaqədar şəxs</dt>
              <dd>{application.contactName}</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd>{application.contactPhone}</dd>
            </div>
            <div>
              <dt>E-poçt</dt>
              <dd>{application.contactEmail ?? '-'}</dd>
            </div>
          </dl>
          <div className="admin-actions">
            <button className="button" type="button" disabled={isBusy || application.status !== 'PENDING'} onClick={() => void handleApprove()}>
              Təsdiqlə
            </button>
            <button className="button button-secondary" type="button" disabled={isBusy || application.status !== 'PENDING'} onClick={() => void handleReject()}>
              Rədd et
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
