'use client';

import { useEffect, useState } from 'react';
import { getAdminReports, updateAdminReportStatus, type AdminReport, type AdminReportStatus } from '../../../lib/admin-api';
import { AdminEmptyBlock, AdminErrorBlock, AdminLoadingBlock, AdminPageHeader, AdminStatusBadge, errorMessage, formatDate } from '../admin-ui';

export default function AdminReportsPage() {
  const [status, setStatus] = useState<AdminReportStatus | ''>('OPEN');
  const [items, setItems] = useState<AdminReport[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function load() {
    setIsLoading(true);
    try {
      const response = await getAdminReports({ status: status || undefined, limit: '80' });
      setItems(response.data);
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function run(id: string, action: 'in-review' | 'resolve' | 'reject') {
    setIsBusy(true);
    setMessage(null);
    try {
      await updateAdminReportStatus(id, action);
      setMessage('Şikayət statusu yeniləndi.');
      await load();
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="admin-page">
      <AdminPageHeader
        kicker="Trust & Safety"
        title="Şikayətlər"
        description="Mağaza və məhsullarla bağlı şikayətləri status üzrə idarə edin."
        action={
          <select className="admin-select" value={status} onChange={(event) => setStatus(event.target.value as AdminReportStatus | '')}>
            <option value="">Bütün statuslar</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_REVIEW">IN_REVIEW</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        }
      />
      {message ? <div className="admin-alert">{message}</div> : null}

      <section className="admin-panel">
        {isLoading ? <AdminLoadingBlock /> : null}
        {hasError ? <AdminErrorBlock /> : null}
        {!isLoading && !hasError && !items.length ? <AdminEmptyBlock title="Şikayət tapılmadı" /> : null}
        {!isLoading && !hasError && items.length ? (
          <div className="admin-list admin-report-list">
            {items.map((report) => (
              <article className="admin-report-card" key={report.id}>
                <div>
                  <strong>{report.type}</strong>
                  <p>{report.message}</p>
                  <small>
                    {report.store?.name ?? report.product?.title ?? 'Ümumi'} · {formatDate(report.createdAt)}
                  </small>
                </div>
                <AdminStatusBadge status={report.status} />
                <div className="admin-actions">
                  <button className="admin-link-button" type="button" disabled={isBusy || report.status === 'IN_REVIEW'} onClick={() => void run(report.id, 'in-review')}>
                    In review
                  </button>
                  <button className="admin-link-button" type="button" disabled={isBusy || report.status === 'RESOLVED'} onClick={() => void run(report.id, 'resolve')}>
                    Resolve
                  </button>
                  <button className="admin-link-button" type="button" disabled={isBusy || report.status === 'REJECTED'} onClick={() => void run(report.id, 'reject')}>
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}
