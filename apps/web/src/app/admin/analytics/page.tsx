'use client';

import { useEffect, useState } from 'react';
import { getAdminAnalytics, type AdminAnalytics } from '../../../lib/admin-api';
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
        kicker="Growth"
        title="Platform analitikası"
        description="Lead event trendi, top mağaza və top məhsul göstəriciləri."
        action={
          <select className="admin-select" value={range} onChange={(event) => setRange(event.target.value as '7d' | '30d' | '90d')}>
            <option value="7d">7 gün</option>
            <option value="30d">30 gün</option>
            <option value="90d">90 gün</option>
          </select>
        }
      />

      <div className="admin-stat-grid">
        <AdminMetricCard label="Total lead" value={compactNumber(analytics.totalLeads)} />
        <AdminMetricCard label="Product view" value={compactNumber(analytics.leadCounts.PRODUCT_VIEW)} />
        <AdminMetricCard label="Store view" value={compactNumber(analytics.leadCounts.STORE_VIEW)} />
        <AdminMetricCard label="WhatsApp" value={compactNumber(analytics.leadCounts.WHATSAPP_CLICK)} />
      </div>

      <div className="admin-two-column">
        <section className="admin-panel">
          <h3>Top mağazalar</h3>
          <div className="admin-list">
            {analytics.topStores.length ? (
              analytics.topStores.map((store) => (
                <AdminListLink key={store.id} href={`/admin/stores/${store.id}`} title={store.name} meta={`${store.city ?? '-'} · ${store.leadCount} lead`} />
              ))
            ) : (
              <AdminEmptyBlock title="Top mağaza yoxdur" />
            )}
          </div>
        </section>

        <section className="admin-panel">
          <h3>Top məhsullar</h3>
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
              <AdminEmptyBlock title="Top məhsul yoxdur" />
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
