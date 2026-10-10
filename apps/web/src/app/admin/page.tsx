'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, MessageSquare, PackageCheck, ShieldCheck, Store } from 'lucide-react';
import { getAdminOverview, type AdminOverview } from '../../lib/admin-api';
import {
  AdminEmptyBlock,
  AdminErrorBlock,
  AdminListLink,
  AdminLoadingBlock,
  AdminMetricCard,
  AdminPageHeader,
  AdminStatusBadge,
  compactNumber,
  formatDate,
} from './admin-ui';
import { reportTypeLabel, statusLabel } from '../../lib/status-labels';
import { useAdminUser } from './admin-shell';

export default function AdminDashboardPage() {
  const isSuperAdmin = useAdminUser()?.role === 'SUPER_ADMIN';
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;

    getAdminOverview()
      .then((response) => {
        if (mounted) {
          setOverview(response.data);
          setHasError(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setHasError(true);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return <AdminLoadingBlock label="Admin panel hazırlanır" />;
  }

  if (hasError || !overview) {
    return <AdminErrorBlock />;
  }

  return (
    <section className="admin-page">
      <AdminPageHeader
        kicker="Əməliyyat paneli"
        title="Ümumi Baxış"
        description="Mağaza müraciətləri, məhsul moderasiyası, şikayətlər və sistem aktivliyi bir yerdə."
        action={isSuperAdmin ? (
          <Link className="button" href="/admin/system">
            Sistem sağlamlığı
          </Link>
        ) : undefined}
      />

      <div className="admin-stat-grid">
        <AdminMetricCard label="Gözləyən mağaza" value={overview.pendingStores} hint="moderasiya" icon={<Store size={20} />} />
        <AdminMetricCard label="Gözləyən məhsul" value={overview.pendingProducts} hint="yoxlama" icon={<PackageCheck size={20} />} />
        <AdminMetricCard label="Açıq şikayət" value={overview.openReports} hint="dəstək" icon={<AlertTriangle size={20} />} />
        <AdminMetricCard label="Aktiv mağaza" value={compactNumber(overview.activeStores)} hint="ictimai" icon={<ShieldCheck size={20} />} />
        <AdminMetricCard label="Aktiv məhsul" value={compactNumber(overview.activeProducts)} hint="kataloq" icon={<BarChart3 size={20} />} />
        <AdminMetricCard label="Bugünkü WhatsApp" value={compactNumber(overview.whatsappClicksToday)} hint="lead" icon={<MessageSquare size={20} />} />
      </div>

      <div className="admin-two-column">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h3>Son mağaza müraciətləri</h3>
            <Link href="/admin/store-applications">Hamısına bax</Link>
          </div>
          <div className="admin-list">
            {overview.recentStoreApplications.length ? (
              overview.recentStoreApplications.map((application) => (
                <AdminListLink
                  key={application.id}
                  href={`/admin/store-applications/${application.id}`}
                  title={application.companyName}
                  meta={`${application.city} · ${formatDate(application.createdAt)}`}
                  badge={<AdminStatusBadge status={application.status} />}
                />
              ))
            ) : (
              <AdminEmptyBlock title="Gözləyən müraciət yoxdur" />
            )}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h3>Gözləyən məhsullar</h3>
            <Link href="/admin/products/pending">Hamısına bax</Link>
          </div>
          <div className="admin-list">
            {overview.recentPendingProducts.length ? (
              overview.recentPendingProducts.map((product) => (
                <AdminListLink
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  title={product.title}
                  meta={`${product.store.name} · ${formatDate(product.updatedAt)}`}
                  badge={<AdminStatusBadge status={product.status} />}
                />
              ))
            ) : (
              <AdminEmptyBlock title="Yoxlama gözləyən məhsul yoxdur" />
            )}
          </div>
        </section>
      </div>

      <div className="admin-two-column">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h3>Son şikayətlər</h3>
            <Link href="/admin/reports">Hamısına bax</Link>
          </div>
          <div className="admin-list">
            {overview.recentReports.length ? (
              overview.recentReports.map((report) => (
                <AdminListLink
                  key={report.id}
                  href="/admin/reports"
                  title={reportTypeLabel(report.type)}
                  meta={`${report.message.slice(0, 86)} · ${formatDate(report.createdAt)}`}
                  badge={<AdminStatusBadge status={report.status} />}
                />
              ))
            ) : (
              <AdminEmptyBlock title="Açıq şikayət yoxdur" />
            )}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h3>Audit hadisələri</h3>
            {isSuperAdmin ? <Link href="/admin/audit-logs">Hamısına bax</Link> : null}
          </div>
          <div className="admin-list">
            {overview.recentAuditLogs.length ? (
              overview.recentAuditLogs.map((log) => (
                <AdminListLink
                  key={log.id}
                  href={isSuperAdmin ? '/admin/audit-logs' : '/admin'}
                  title={statusLabel(log.action)}
                  meta={`${statusLabel(log.resourceType)} · ${formatDate(log.createdAt)}`}
                />
              ))
            ) : (
              <AdminEmptyBlock title="Audit jurnalı hələ boşdur" />
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
