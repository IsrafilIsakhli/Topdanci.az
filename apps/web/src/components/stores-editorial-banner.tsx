import Link from 'next/link';
import { ArrowRight, BadgeCheck, MapPin, Package, TrendingUp } from 'lucide-react';
import { LeadWhatsAppLink } from './lead-actions';
import type { StorePreview } from '../lib/catalog-data';
import { storeAccent } from '../lib/store-accent';

type StoresEditorialBannerProps = {
  store: StorePreview;
};

/** "Bu həftə ən çox baxılan" — redaksiya seçimi full-width banner. */
export function StoresEditorialBanner({ store }: StoresEditorialBannerProps) {
  const accent = storeAccent(store.slug);

  return (
    <section aria-label="Bu həftə ən çox baxılan mağaza" className="section stores-editorial-section">
      <div className="container">
        <div className="stores-editorial-banner">
          <div className="stores-editorial-copy">
            <p className="stores-editorial-eyebrow">
              <TrendingUp size={14} />
              Bu həftə ən çox baxılan
            </p>
            <h2>{store.name}</h2>
            {store.description ? <p className="stores-editorial-lead">{store.description}</p> : null}
            <div className="stores-editorial-meta">
              <span>
                <MapPin size={14} />
                {store.city}
              </span>
              <span>
                <Package size={14} />
                {store.productCount} məhsul
              </span>
              <span>
                <TrendingUp size={14} />
                {store.views} baxış
              </span>
              {store.verified ? (
                <span className="stores-editorial-verified">
                  <BadgeCheck size={14} />
                  Təsdiqlənmiş
                </span>
              ) : null}
            </div>
            <div className="stores-editorial-actions">
              <Link className="button stores-editorial-cta" href={`/stores/${store.slug}`}>
                Mağazaya bax
                <ArrowRight size={16} />
              </Link>
              <LeadWhatsAppLink
                className="button stores-editorial-wa"
                phone={store.whatsappNumber}
                source="stores-editorial-banner"
                storeId={store.id}
                storeName={store.name}
              >
                WhatsApp
              </LeadWhatsAppLink>
            </div>
          </div>
          <Link
            aria-label={`${store.name} mağazasını aç`}
            className="stores-editorial-cover"
            href={`/stores/${store.slug}`}
            style={{ backgroundImage: `url(${store.coverImageUrl})`, backgroundColor: accent.bg }}
          >
            <span className="store-avatar" style={{ backgroundColor: accent.fg, color: '#ffffff' }}>
              {store.name.slice(0, 2).toUpperCase()}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
