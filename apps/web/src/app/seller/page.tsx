'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, BadgeCheck, Eye, MessageSquare, Package, Pencil, Plus, Sparkles, Store, TimerReset } from 'lucide-react';
import { ApiClientError } from '../../lib/api-client';
import { CountUp } from '../../components/count-up';
import { getSellerLeads, getSellerOverview, type SellerLead, type SellerOverview } from '../../lib/seller-api';
import { LeadActivityChart } from './dashboard/lead-activity-chart';
import { OnboardingRing } from './dashboard/onboarding-ring';
import {
  buildWeekSeries,
  greetingFor,
  leadIcon,
  leadLabels,
  leadTone,
  statusLabels,
  timeAgo,
} from './dashboard/dashboard-utils';

type StatTile = {
  label: string;
  value: number;
  caption: string;
  icon: LucideIcon;
  accent: 'emerald' | 'sky' | 'amber' | 'violet' | 'rose';
  spark?: number[];
};

export default function SellerDashboardPage() {
  const [overview, setOverview] = useState<SellerOverview | null>(null);
  const [weekLeads, setWeekLeads] = useState<SellerLead[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let mounted = true;

    setNow(new Date());

    Promise.all([getSellerOverview(), getSellerLeads({ range: '7d' }).catch(() => null)])
      .then(([overviewResponse, leadsResponse]) => {
        if (!mounted) return;
        setOverview(overviewResponse.data);
        setWeekLeads(leadsResponse?.data ?? []);
        setError('');
      })
      .catch((caught) => {
        if (!mounted) return;
        const status = caught instanceof ApiClientError ? caught.status : undefined;
        setError(status === 403 ? 'Bu panelə giriş icazəniz yoxdur.' : 'Panel məlumatları yüklənmədi.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const weekSeries = useMemo(() => buildWeekSeries(weekLeads), [weekLeads]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="seller-page">
        <section className="dash2-state">
          <strong>Məlumat yüklənmədi</strong>
          <p>{error}</p>
          <button className="dash2-cta" type="button" onClick={() => window.location.reload()}>
            Yenidən yoxla
          </button>
        </section>
      </div>
    );
  }

  const store = overview?.stores[0];

  if (!overview || !store) {
    return (
      <div className="seller-page">
        <section className="dash2-state">
          <strong>Mağaza tapılmadı</strong>
          <p>Bu hesaba bağlı aktiv mağaza yoxdur.</p>
          <Link className="dash2-cta" href="/open-store">
            Mağaza yarat
          </Link>
        </section>
      </div>
    );
  }
  const onboarding = store.onboarding;
  const storeInitials = store.name
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
  const greeting = now ? greetingFor(now.getHours()) : 'Xoş gəlmisiniz';

  const weekTotal = weekSeries.reduce((sum, day) => sum + day.total, 0);
  const chartPoints = weekSeries.map((day) => ({ label: day.label, value: day.total }));

  const tiles: StatTile[] = [
    { label: 'Ümumi məhsul', value: overview.totalProducts, caption: 'kataloqda', icon: Package, accent: 'emerald' },
    { label: 'Aktiv məhsul', value: overview.activeProducts, caption: 'satışda görünür', icon: Store, accent: 'sky' },
    { label: 'Gözləyən məhsul', value: overview.pendingProducts, caption: 'yoxlamada', icon: TimerReset, accent: 'amber' },
    { label: 'Qaralama', value: overview.draftProducts, caption: 'redaktə olunur', icon: Pencil, accent: 'violet' },
    {
      label: 'WhatsApp klik',
      value: overview.whatsappClicksToday,
      caption: 'son 7 gün',
      icon: MessageSquare,
      accent: 'emerald',
      spark: weekSeries.map((day) => day.whatsapp),
    },
    { label: 'Mağaza baxışı', value: overview.storeViewsToday, caption: 'bu gün', icon: Eye, accent: 'rose' },
  ];

  const topProducts = [...overview.topProducts].sort((a, b) => b.leadCount - a.leadCount).slice(0, 5);
  const maxLeadCount = Math.max(...topProducts.map((product) => product.leadCount), 1);

  return (
    <DashboardView
      greeting={greeting}
      chartPoints={chartPoints}
      maxLeadCount={maxLeadCount}
      now={now}
      onboarding={onboarding}
      recentLeads={overview.recentLeads}
      storeInitials={storeInitials}
      storeName={store.name}
      storeVerified={store.verified}
      storeProductCount={store.productCount}
      tiles={tiles}
      topProducts={topProducts}
      weekTotal={weekTotal}
    />
  );
}

type DashboardViewProps = {
  greeting: string;
  chartPoints: Array<{ label: string; value: number }>;
  maxLeadCount: number;
  now: Date | null;
  onboarding: SellerOverview['stores'][number]['onboarding'];
  recentLeads: SellerOverview['recentLeads'];
  storeInitials: string;
  storeName: string;
  storeVerified: boolean;
  storeProductCount: number;
  tiles: StatTile[];
  topProducts: SellerOverview['topProducts'];
  weekTotal: number;
};

function DashboardView({
  greeting,
  chartPoints,
  maxLeadCount,
  now,
  onboarding,
  recentLeads,
  storeInitials,
  storeName,
  storeVerified,
  storeProductCount,
  tiles,
  topProducts,
  weekTotal,
}: DashboardViewProps) {
  return (
    <div className="seller-page">
      <div className="dash2-page">
        {/* ---- Hero ---- */}
        <section className="dash2-hero">
          <div className="dash2-hero-id">
            <span aria-hidden="true" className="dash2-avatar">
              {storeInitials}
            </span>
            <div>
              <div className="dash2-hero-kicker">
                <Sparkles size={13} />
                <span>{greeting}</span>
                {now ? (
                  <span className="dash2-hero-date">
                    · {now.toLocaleDateString('az-AZ', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                ) : null}
              </div>
              <h2 className="dash2-hero-title">{storeName}</h2>
              <div className="dash2-hero-meta">
                <span className={`dash2-pill ${storeVerified ? 'is-verified' : 'is-pending'}`}>
                  {storeVerified ? <BadgeCheck size={13} /> : <TimerReset size={13} />}
                  {storeVerified ? 'Təsdiqlənib' : 'Təsdiq gözləyir'}
                </span>
                <span className="dash2-live">
                  <i aria-hidden="true" />
                  Canlı
                </span>
                <span className="dash2-meta-count">{storeProductCount} məhsul</span>
              </div>
            </div>
          </div>

          <div className="dash2-hero-actions">
            <Link className="dash2-ghost-button" href="/seller/store">
              Profili redaktə et
            </Link>
            <Link className="dash2-cta" href="/seller/products/new">
              <Plus size={16} />
              Yeni məhsul
            </Link>
          </div>
        </section>

        {/* ---- KPI plitələri ---- */}
        <section aria-label="Əsas göstəricilər" className="dash2-stats">
          {tiles.map((tile, index) => {
            const Icon = tile.icon;
            const sparkMax = Math.max(...(tile.spark ?? [1]), 1);

            return (
              <article
                className={`dash2-tile is-${tile.accent}`}
                key={tile.label}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="dash2-tile-head">
                  <small>{tile.label}</small>
                  <span className="dash2-tile-icon">
                    <Icon size={17} />
                  </span>
                </div>
                <strong className="dash2-tile-value">
                  <CountUp value={tile.value} />
                </strong>
                <div className="dash2-tile-foot">
                  {tile.spark ? (
                    <div aria-hidden="true" className="dash2-spark">
                      {tile.spark.map((value, sparkIndex) => (
                        <i
                          key={sparkIndex}
                          style={{
                            height: `${Math.max(10, (value / sparkMax) * 100)}%`,
                            animationDelay: `${280 + sparkIndex * 55}ms`,
                          }}
                        />
                      ))}
                    </div>
                  ) : null}
                  <small>{tile.caption}</small>
                </div>
              </article>
            );
          })}
        </section>

        {/* ---- Bento şəbəkə ---- */}
        <section className="dash2-grid">
          <article className="dash2-card dash2-span-8" style={{ animationDelay: '80ms' }}>
            <header className="dash2-card-head">
              <div>
                <h3>Lead axını</h3>
                <p>Son 7 gün ərzində bütün hadisələr</p>
              </div>
              <span className="dash2-chip">{weekTotal} hadisə</span>
            </header>
            <LeadActivityChart points={chartPoints} />
          </article>

          {onboarding && onboarding.percentage < 100 ? (
            <article className="dash2-card dash2-span-4" style={{ animationDelay: '160ms' }}>
              <header className="dash2-card-head">
                <div>
                  <h3>Mağazanı tamamla</h3>
                  <p>Profil nə qədər doludur?</p>
                </div>
              </header>
              <OnboardingRing
                completed={onboarding.completed}
                percentage={onboarding.percentage}
                steps={onboarding.steps}
                total={onboarding.total}
              />
            </article>
          ) : (
            <article className="dash2-card dash2-span-4 dash2-ready" style={{ animationDelay: '160ms' }}>
              <span className="dash2-ready-badge">
                <BadgeCheck size={22} />
              </span>
              <strong>Mağazanız hazırdır</strong>
              <p>Bütün addımlar tamamlandı. İlk məhsulu əlavə edərək satışa başlayın.</p>
              <Link className="dash2-cta" href="/seller/products/new">
                <Plus size={15} />
                Məhsul əlavə et
              </Link>
            </article>
          )}

          <article className="dash2-card dash2-span-6" style={{ animationDelay: '240ms' }}>
            <header className="dash2-card-head">
              <div>
                <h3>Ən çox baxılan məhsullar</h3>
                <p>Lead hadisələrinə görə reytinq</p>
              </div>
              <Link className="dash2-card-link" href="/seller/products">
                Hamısına bax
                <ArrowUpRight size={14} />
              </Link>
            </header>
            <div className="dash2-board">
              {topProducts.length ? (
                topProducts.map((product, index) => (
                  <div className="dash2-board-row" key={`${product.id}-${product.title}`}>
                    <span className={`dash2-rank${index < 3 ? ` is-${index + 1}` : ''}`}>{index + 1}</span>
                    <span
                      className="dash2-thumb"
                      style={product.image?.cdnUrl ? { backgroundImage: `url(${product.image.cdnUrl})` } : undefined}
                    >
                      {product.image?.cdnUrl ? null : product.title.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="dash2-board-info">
                      <strong>{product.title}</strong>
                      <span className={`dash2-status ${statusLabels[product.status ?? '']?.tone ?? 'is-draft'}`}>
                        {statusLabels[product.status ?? '']?.label ?? 'Naməlum'}
                      </span>
                      <span className="dash2-bar">
                        <i
                          style={{
                            width: `${Math.max(6, (product.leadCount / maxLeadCount) * 100)}%`,
                            animationDelay: `${320 + index * 80}ms`,
                          }}
                        />
                      </span>
                    </div>
                    <div className="dash2-board-count">
                      <strong>{product.leadCount.toLocaleString('az-AZ')}</strong>
                      hadisə
                    </div>
                  </div>
                ))
              ) : (
                <div className="dash2-empty">
                  <Package size={20} />
                  <span>Hələ lead məlumatı yoxdur.</span>
                </div>
              )}
            </div>
          </article>

          <article className="dash2-card dash2-span-6" style={{ animationDelay: '320ms' }}>
            <header className="dash2-card-head">
              <div>
                <h3>Son müraciətlər</h3>
                <p>Alıcıların son hərəkətləri</p>
              </div>
              <Link className="dash2-card-link" href="/seller/leads">
                Hamısı
                <ArrowUpRight size={14} />
              </Link>
            </header>
            <div className="dash2-timeline">
              {recentLeads.length ? (
                recentLeads.slice(0, 6).map((lead) => {
                  const Icon = leadIcon(lead.type);
                  return (
                    <div className={`dash2-tl-row ${leadTone(lead.type)}`} key={lead.id}>
                      <span className="dash2-tl-dot">
                        <Icon size={16} />
                      </span>
                      <div className="dash2-tl-body">
                        <strong>{leadLabels[lead.type]}</strong>
                        <small>{lead.product?.title ?? lead.store.name}</small>
                      </div>
                      <time className="dash2-tl-time">{timeAgo(lead.createdAt)}</time>
                    </div>
                  );
                })
              ) : (
                <div className="dash2-empty">
                  <Sparkles size={20} />
                  <span>Müraciət və baxışlar burada görünəcək.</span>
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="seller-page">
      <div className="dash2-page">
        <div className="dash2-skel is-hero" />
        <div className="dash2-stats">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="dash2-skel is-stat" key={index} style={{ animationDelay: `${index * 60}ms` }} />
          ))}
        </div>
        <div className="dash2-grid">
          <div className="dash2-skel is-panel dash2-span-8" />
          <div className="dash2-skel is-panel dash2-span-4" />
          <div className="dash2-skel is-panel dash2-span-6" />
          <div className="dash2-skel is-panel dash2-span-6" />
        </div>
      </div>
    </div>
  );
}
