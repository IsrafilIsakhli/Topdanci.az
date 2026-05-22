'use client';

import { useEffect, useState } from 'react';
import { getAdminAuditLogs, type AdminAuditLog } from '../../../lib/admin-api';
import { AdminEmptyBlock, AdminErrorBlock, AdminLoadingBlock, AdminPageHeader, formatDate } from '../admin-ui';

export default function AdminAuditLogsPage() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getAdminAuditLogs({ action: query.trim() || undefined, limit: '100' })
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
  }, [query]);

  return (
    <section className="admin-page">
      <AdminPageHeader
        kicker="Superadmin"
        title="Audit log"
        description="Kritik admin və seller əməliyyatları burada redaktəsiz, amma secret-siz görünür."
      />
      <div className="admin-toolbar">
        <input className="admin-input" placeholder="Action filter: ADMIN_PRODUCT_APPROVED" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <section className="admin-panel">
        {isLoading ? <AdminLoadingBlock /> : null}
        {hasError ? <AdminErrorBlock message="Audit log yalnız SUPER_ADMIN üçün açıqdır." /> : null}
        {!isLoading && !hasError && !items.length ? <AdminEmptyBlock title="Audit log tapılmadı" /> : null}
        {!isLoading && !hasError && items.length ? (
          <div className="admin-timeline">
            {items.map((log) => (
              <article key={log.id}>
                <span>{formatDate(log.createdAt)}</span>
                <strong>{log.action}</strong>
                <small>{log.resourceType} · {log.resourceId}</small>
                <code>{JSON.stringify(log.metadata ?? {}, null, 2)}</code>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}
