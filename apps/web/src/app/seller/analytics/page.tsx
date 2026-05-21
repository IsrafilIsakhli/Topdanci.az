'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Eye, MessageSquare, Phone, Store } from 'lucide-react';
import { getSellerAnalytics, type SellerAnalytics } from '../../../lib/seller-api';

const ranges = [
  { label: '7 gün', value: '7d' },
  { label: '30 gün', value: '30d' },
  { label: '90 gün', value: '90d' },
] as const;

export default function SellerAnalyticsPage() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    getSellerAnalytics(range)
      .then((response) => {
        setAnalytics(response.data);
        setError('');
      })
      .catch(() => setError('Statistika yüklənmədi.'))
      .finally(() => setIsLoading(false));
  }, [range]);

  const leadStats = analytics
    ? [
        { label: 'Məhsul baxışı', value: analytics.leadCounts.productViews, icon: Eye },
        { label: 'Mağaza baxışı', value: analytics.leadCounts.storeViews, icon: Store },
        { label: 'WhatsApp klik', value: analytics.leadCounts.whatsappClicks, icon: MessageSquare },
        { label: 'Telefon göstərildi', value: analytics.leadCounts.phoneReveals, icon: Phone },
      ]
    : [];

  return (
    <div className="seller-page">
      <div className="seller-page-head seller-page-head-row">
        <div>
          <span className="seller-kicker">Analitika</span>
          <h2>Mağaza statistikası</h2>
          <p>Raw IP və user-agent göstərilmir. Yalnız təhlükəsiz lead sayları paneldə görünür.</p>
        </div>
        <div className="seller-range-switch">
          {ranges.map((item) => (
            <button type="button" className={range === item.value ? 'is-active' : ''} key={item.value} onClick={() => setRange(item.value)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error ? <div className="form-alert form-alert-error">{error}</div> : null}

      {isLoading || !analytics ? (
        <div className="seller-skeleton seller-skeleton-hero">Statistika hazırlanır</div>
      ) : (
        <>
          <section className="seller-stat-grid">
            <article className="seller-stat-card seller-stat-card-wide">
              <span>
                <BarChart3 size={19} />
              </span>
              <small>Ümumi lead hadisəsi</small>
              <strong>{analytics.totalLeads.toLocaleString('az-AZ')}</strong>
            </article>
            {leadStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article className="seller-stat-card" key={stat.label}>
                  <span>
                    <Icon size={19} />
                  </span>
                  <small>{stat.label}</small>
                  <strong>{stat.value.toLocaleString('az-AZ')}</strong>
                </article>
              );
            })}
          </section>

          <section className="seller-card">
            <div className="seller-card-head">
              <div>
                <span className="seller-kicker">Məhsul vəziyyəti</span>
                <h3>Status paylanması</h3>
              </div>
            </div>
            <div className="seller-status-bars">
              {[
                ['Qaralama', analytics.productCounts.draft],
                ['Yoxlamada', analytics.productCounts.pendingReview],
                ['Aktiv', analytics.productCounts.active],
                ['Passiv', analytics.productCounts.passive],
                ['Rədd edildi', analytics.productCounts.rejected],
              ].map(([label, value]) => {
                const numberValue = Number(value);
                const total = Math.max(
                  1,
                  analytics.productCounts.draft +
                    analytics.productCounts.pendingReview +
                    analytics.productCounts.active +
                    analytics.productCounts.passive +
                    analytics.productCounts.rejected,
                );
                return (
                  <div className="seller-status-bar" key={label}>
                    <span>{label}</span>
                    <strong>{numberValue}</strong>
                    <em style={{ width: `${Math.max(6, (numberValue / total) * 100)}%` }} />
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
