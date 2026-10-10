'use client';

import { useEffect, useState } from 'react';
import { getAdminSystem, type AdminSystem } from '../../../lib/admin-api';
import { AdminErrorBlock, AdminLoadingBlock, AdminMetricCard, AdminPageHeader, AdminStatusBadge, formatDate } from '../admin-ui';

export default function AdminSystemPage() {
  const [system, setSystem] = useState<AdminSystem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAdminSystem()
      .then((response) => {
        if (mounted) {
          setSystem(response.data);
          setHasError(false);
        }
      })
      .catch(() => mounted && setHasError(true))
      .finally(() => mounted && setIsLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) return <AdminLoadingBlock label="Sistem statusu yoxlanır" />;
  if (hasError || !system) return <AdminErrorBlock message="Sistem səhifəsi yalnız SUPER_ADMIN üçün açıqdır." />;

  return (
    <section className="admin-page">
      <AdminPageHeader
        kicker="Sistem vəziyyəti"
        title="Sistem sağlamlığı"
        description={`Son yoxlama: ${formatDate(system.timestamp)}`}
        action={<AdminStatusBadge status={system.status} />}
      />
      <div className="admin-stat-grid">
        <AdminMetricCard label="Sorğu sayı" value={system.metrics.requests.count} />
        <AdminMetricCard label="Xəta sayı" value={system.metrics.requests.errors} />
        <AdminMetricCard label="Orta müddət" value={`${Math.round(system.metrics.requests.averageDurationMs)}ms`} />
        <AdminMetricCard label="Uğursuz növbə" value={system.metrics.worker.failed} />
      </div>
      <section className="admin-panel">
        <h3>Asılılıqlar</h3>
        <div className="admin-card-grid">
          {Object.entries(system.dependencies).map(([name, dependency]) => (
            <article className="admin-dependency-card" key={name}>
              <strong>{name}</strong>
              <AdminStatusBadge status={dependency.ok ? 'OK' : 'FAILED'} />
              {dependency.error ? <small>{dependency.error}</small> : <small>Hazırdır</small>}
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
