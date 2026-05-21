'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, Eye, MessageSquare, PackageCheck, Store, TimerReset } from 'lucide-react';
import { ApiClientError } from '../../lib/api-client';
import { getSellerOverview, type SellerOverview } from '../../lib/seller-api';

const leadLabels = {
  PRODUCT_VIEW: 'Məhsul baxışı',
  STORE_VIEW: 'Mağaza baxışı',
  WHATSAPP_CLICK: 'WhatsApp klik',
  PHONE_REVEAL: 'Telefon göstərildi',
  EMAIL_CLICK: 'E-poçt klik',
};

export default function SellerDashboardPage() {
  const [overview, setOverview] = useState<SellerOverview | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSellerOverview()
      .then((response) => {
        setOverview(response.data);
        setError('');
      })
      .catch((caught) => {
        const status = caught instanceof ApiClientError ? caught.status : undefined;
        setError(status === 403 ? 'Bu panelə giriş icazəniz yoxdur.' : 'Panel məlumatları yüklənmədi.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <SellerPageSkeleton title="Panel hazırlanır" />;
  }

  if (error) {
    return <SellerErrorState message={error} />;
  }

  if (!overview) {
    return <SellerEmptyState title="Mağaza tapılmadı" description="Bu hesaba bağlı aktiv mağaza yoxdur." />;
  }

  const stats = [
    { label: 'Ümumi məhsul', value: overview.totalProducts, icon: PackageCheck },
    { label: 'Aktiv məhsul', value: overview.activeProducts, icon: Store },
    { label: 'Gözləyən məhsul', value: overview.pendingProducts, icon: TimerReset },
    { label: 'Bugünkü WhatsApp', value: overview.whatsappClicksToday, icon: MessageSquare },
    { label: 'Bugünkü mağaza baxışı', value: overview.storeViewsToday, icon: Eye },
    { label: 'Qaralama', value: overview.draftProducts, icon: BarChart3 },
  ];

  return (
    <div className="seller-page">
      <section className="seller-hero-card">
        <div>
          <span className="seller-kicker">Mağaza mərkəzi</span>
          <h2>Xoş gəldiniz, satışınızı buradan idarə edin</h2>
          <p>
            Məhsullarınızı yoxlamaya göndərin, müraciətləri izləyin və alıcıların hansı məhsullara daha çox baxdığını
            görün.
          </p>
        </div>
        <Link className="button button-primary" href="/seller/products/new">
          Yeni məhsul
          <ArrowRight size={16} />
        </Link>
      </section>

      <section className="seller-stat-grid">
        {stats.map((stat) => {
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

      <section className="seller-two-column">
        <article className="seller-card">
          <div className="seller-card-head">
            <div>
              <span className="seller-kicker">Performans</span>
              <h3>Ən çox baxılan məhsullar</h3>
            </div>
            <Link href="/seller/products">Hamısına bax</Link>
          </div>
          <div className="seller-list">
            {overview.topProducts.length ? (
              overview.topProducts.map((product) => (
                <div className="seller-list-row" key={`${product.id}-${product.title}`}>
                  <span className="seller-thumb" style={{ backgroundImage: product.image?.cdnUrl ? `url(${product.image.cdnUrl})` : undefined }}>
                    {!product.image?.cdnUrl ? 'TB' : null}
                  </span>
                  <span>
                    <strong>{product.title}</strong>
                    <small>{product.leadCount.toLocaleString('az-AZ')} lead hadisəsi</small>
                  </span>
                  <em>{product.status ?? 'N/A'}</em>
                </div>
              ))
            ) : (
              <SellerInlineEmpty text="Hələ lead məlumatı yoxdur." />
            )}
          </div>
        </article>

        <article className="seller-card">
          <div className="seller-card-head">
            <div>
              <span className="seller-kicker">Canlı axın</span>
              <h3>Son müraciətlər</h3>
            </div>
            <Link href="/seller/leads">Hamısı</Link>
          </div>
          <div className="seller-list">
            {overview.recentLeads.length ? (
              overview.recentLeads.map((lead) => (
                <div className="seller-list-row" key={lead.id}>
                  <span className="seller-icon-soft">
                    {lead.type === 'WHATSAPP_CLICK' ? <MessageSquare size={17} /> : <Eye size={17} />}
                  </span>
                  <span>
                    <strong>{leadLabels[lead.type]}</strong>
                    <small>{lead.product?.title ?? lead.store.name}</small>
                  </span>
                  <time>{new Date(lead.createdAt).toLocaleDateString('az-AZ')}</time>
                </div>
              ))
            ) : (
              <SellerInlineEmpty text="Müraciət və baxışlar burada görünəcək." />
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function SellerPageSkeleton({ title }: { title: string }) {
  return (
    <div className="seller-page">
      <div className="seller-skeleton seller-skeleton-hero">{title}</div>
      <div className="seller-stat-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="seller-skeleton seller-skeleton-stat" key={index} />
        ))}
      </div>
    </div>
  );
}

function SellerErrorState({ message }: { message: string }) {
  return (
    <div className="seller-card seller-state-card">
      <h2>Məlumat yüklənmədi</h2>
      <p>{message}</p>
      <button className="button button-primary" type="button" onClick={() => window.location.reload()}>
        Yenidən yoxla
      </button>
    </div>
  );
}

function SellerEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="seller-card seller-state-card">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function SellerInlineEmpty({ text }: { text: string }) {
  return <div className="seller-inline-empty">{text}</div>;
}
