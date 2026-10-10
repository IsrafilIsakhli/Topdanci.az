'use client';

import { useEffect, useState } from 'react';
import { getAdminAnalytics, type AdminAnalytics } from '../../../lib/admin-api';
import { LeadActivityChart } from '../../seller/dashboard/lead-activity-chart';
import { formatDayLabel } from '../../../lib/display-format';
import { AdminEmptyBlock, AdminErrorBlock, AdminListLink, AdminLoadingBlock, AdminMetricCard, AdminPageHeader, compactNumber } from '../admin-ui';

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getAdminAnalytics(range)
      .then((response) => {
        if (mounted) {
          setAnalytics(response.data);
          setHasError(false);
        }
      })
      .catch(() => mounted && setHasError(true))
      .finally(() => mounted && setIsLoading(false));

    return () => {
      mounted = false;
    };
  }, [range]);

  if (isLoading) return <AdminLoadingBlock label="Analitika hazırlanır" />;
  if (hasError || !analytics) return <AdminErrorBlock />;

  return (
    <section className="admin-page">
      <AdminPageHeader
        kicker="Böyümə"
        title="Platform analitikası"
        description="Baxış və əlaqə hadisələri, ən çox maraq göstərilən mağaza və məhsullar."
        action={
          <select
            aria-label="Tarix aralığı"
            className="admin-select"
            value={range}
            onChange={(event) => setRange(event.target.value as '7d' | '30d' | '90d')}
          >
            <option value="7d">7 gün</option>
            <option value="30d">30 gün</option>
            <option value="90d">90 gün</option>
          </select>
        }
      />

      <div className="admin-stat-grid">
        <AdminMetricCard label="Ümumi fəaliyyət" value={compactNumber(analytics.totalLeads)} />
        <AdminMetricCard label="Məhsul baxışı" value={compactNumber(analytics.leadCounts.PRODUCT_VIEW)} />
        <AdminMetricCard label="Mağaza baxışı" value={compactNumber(analytics.leadCounts.STORE_VIEW)} />
        <AdminMetricCard label="WhatsApp klikləri" value={compactNumber(analytics.leadCounts.WHATSAPP_CLICK)} />
      </div>

      <section className="admin-panel">
        <h3>Fəaliyyətin dəyişməsi</h3>
        <LeadActivityChart points={analytics.trend.map((point) => ({ label: formatDayLabel(point.day), value: point.count }))} />
      </section>

      <div className="admin-two-column">
        <section className="admin-panel">
          <h3>Ən çox baxılan mağazalar</h3>
          <div className="admin-list">
            {analytics.topStores.length ? (
              analytics.topStores.map((store) => (
                <AdminListLink key={store.id} href={`/admin/stores/${store.id}`} title={store.name} meta={`${store.city ?? '-'} · ${store.leadCount} lead`} />
              ))
            ) : (
              <AdminEmptyBlock title="Bu dövrdə mağaza fəaliyyəti yoxdur" />
            )}
          </div>
        </section>

        <section className="admin-panel">
          <h3>Ən çox baxılan məhsullar</h3>
          <div className="admin-list">
            {analytics.topProducts.length ? (
              analytics.topProducts.map((product, index) => (
                <AdminListLink
                  key={product.id ?? `${product.title}-${index}`}
                  href={product.id ? `/admin/products/${product.id}` : '/admin/products'}
                  title={product.title}
                  meta={`${product.store?.name ?? '-'} · ${product.leadCount} lead`}
                />
              ))
            ) : (
              <AdminEmptyBlock title="Bu dövrdə məhsul fəaliyyəti yoxdur" />
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
