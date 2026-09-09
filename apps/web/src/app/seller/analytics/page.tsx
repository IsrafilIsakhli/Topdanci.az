'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Eye, MessageSquare, Phone, Store } from 'lucide-react';
import { getSellerAnalytics, type SellerAnalytics } from '../../../lib/seller-api';
import { CountUp } from '../../../components/count-up';

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
    let mounted = true;
    setIsLoading(true);

    getSellerAnalytics(range)
      .then((response) => {
        if (!mounted) return;
        setAnalytics(response.data);
        setError('');
      })
      .catch(() => {
        if (mounted) setError('Statistika yüklənmədi.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [range]);

  const total = analytics
    ? analytics.productCounts.draft +
      analytics.productCounts.pendingReview +
      analytics.productCounts.active +
      analytics.productCounts.passive +
      analytics.productCounts.rejected
    : 0;

  const distribution = analytics
    ? [
        { label: 'Qaralama', value: analytics.productCounts.draft, accent: '#8b5cf6' },
        { label: 'Yoxlamada', value: analytics.productCounts.pendingReview, accent: '#f59e0b' },
        { label: 'Aktiv', value: analytics.productCounts.active, accent: '#10b981' },
        { label: 'Passiv', value: analytics.productCounts.passive, accent: '#0ea5e9' },
        { label: 'Rədd edildi', value: analytics.productCounts.rejected, accent: '#f43f5e' },
      ]
    : [];

  return (
    <div className="seller-page">
      <div className="dash2-page">
        <div className="dash2-page-head">
          <div>
            <h2>Mağaza statistikası</h2>
            <p>Raw IP və user-agent göstərilmir. Yalnız təhlükəsiz lead sayları paneldə görünür.</p>
          </div>
          <div aria-label="Period seçimi" className="dash2-range" role="group">
            {ranges.map((item) => (
              <button
                className={range === item.value ? 'is-active' : ''}
                key={item.value}
                type="button"
                onClick={() => setRange(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error ? <div className="form-alert form-alert-error">{error}</div> : null}

        {isLoading || !analytics ? (
          <div className="dash2-skel is-hero">Statistika hazırlanır</div>
        ) : (
          <>
            <section aria-label="Lead göstəriciləri" className="dash2-stats">
              <article className="dash2-tile is-emerald" style={{ animationDelay: '0ms' }}>
                <div className="dash2-tile-head">
                  <small>Ümumi lead hadisəsi</small>
                  <span className="dash2-tile-icon">
                    <BarChart3 size={17} />
                  </span>
                </div>
                <strong className="dash2-tile-value">
                  <CountUp value={analytics.totalLeads} />
                </strong>
                <div className="dash2-tile-foot">
                  <small>seçilən period</small>
                </div>
              </article>

              <article className="dash2-tile is-sky" style={{ animationDelay: '60ms' }}>
                <div className="dash2-tile-head">
                  <small>Məhsul baxışı</small>
                  <span className="dash2-tile-icon">
                    <Eye size={17} />
                  </span>
                </div>
                <strong className="dash2-tile-value">
                  <CountUp value={analytics.leadCounts.productViews} />
                </strong>
                <div className="dash2-tile-foot">
                  <small>məhsul səhifələri</small>
                </div>
              </article>

              <article className="dash2-tile is-violet" style={{ animationDelay: '120ms' }}>
                <div className="dash2-tile-head">
                  <small>Mağaza baxışı</small>
                  <span className="dash2-tile-icon">
                    <Store size={17} />
                  </span>
                </div>
                <strong className="dash2-tile-value">
                  <CountUp value={analytics.leadCounts.storeViews} />
                </strong>
                <div className="dash2-tile-foot">
                  <small>mağaza profili</small>
                </div>
              </article>

              <article className="dash2-tile is-amber" style={{ animationDelay: '180ms' }}>
                <div className="dash2-tile-head">
                  <small>WhatsApp klik</small>
                  <span className="dash2-tile-icon">
                    <MessageSquare size={17} />
                  </span>
                </div>
                <strong className="dash2-tile-value">
                  <CountUp value={analytics.leadCounts.whatsappClicks} />
                </strong>
                <div className="dash2-tile-foot">
                  <small>birbaşa əlaqə</small>
                </div>
              </article>

              <article className="dash2-tile is-rose" style={{ animationDelay: '240ms' }}>
                <div className="dash2-tile-head">
                  <small>Telefon göstərildi</small>
                  <span className="dash2-tile-icon">
                    <Phone size={17} />
                  </span>
                </div>
                <strong className="dash2-tile-value">
                  <CountUp value={analytics.leadCounts.phoneReveals} />
                </strong>
                <div className="dash2-tile-foot">
                  <small>numaraya baxış</small>
                </div>
              </article>
            </section>

            <section className="dash2-section" style={{ animationDelay: '280ms' }}>
              <header className="dash2-section-head">
                <span className="dash2-card-icon">
                  <BarChart3 size={19} />
                </span>
                <div>
                  <h3>Status paylanması</h3>
                  <p className="dash2-section-sub">Məhsulların statuslar üzrə sayı</p>
                </div>
              </header>
              <div className="dash2-dist">
                {distribution.map((row, index) => (
                  <div className="dash2-dist-row" key={row.label} style={{ animationDelay: `${320 + index * 60}ms` }}>
                    <span>{row.label}</span>
                    <span className="dash2-dist-bar">
                      <i
                        style={{
                          width: `${Math.max(4, (row.value / Math.max(total, 1)) * 100)}%`,
                          background: row.accent,
                          animationDelay: `${360 + index * 60}ms`,
                        }}
                      />
                    </span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
