import Link from 'next/link';
import { ArrowRight, BadgeCheck, MapPin, MessageCircle, Package, TrendingUp } from 'lucide-react';
import type { ProductPreview, StorePreview } from '../lib/catalog-data';
import { storeAccent } from '../lib/store-accent';
import { LeadWhatsAppLink } from './lead-actions';

type StoreMarketCardProps = {
  store: StorePreview;
  products: ProductPreview[];
  sponsored: boolean;
};

export function StoreMarketCard({ store, products, sponsored }: StoreMarketCardProps) {
  const accent = storeAccent(store.slug);

  return (
    <article className="card store-market-card">
      <Link className="store-market-link" href={`/stores/${store.slug}`} aria-label={`${store.name} mağazasına bax`}>
        <span
          className="store-market-cover"
          style={{ backgroundImage: `url(${store.coverImageUrl})`, backgroundColor: accent.bg }}
        >
          {store.verified ? (
            <span>
              <BadgeCheck size={13} />
              Təsdiqli
            </span>
          ) : null}
          {sponsored ? <em>Bu həftə</em> : null}
        </span>

        <span className="store-market-body">
          <span className="store-market-head">
            <span className="store-avatar" style={{ backgroundColor: accent.bg, color: accent.fg }}>
              {store.name.slice(0, 2).toUpperCase()}
            </span>
            <span>
              <strong>{store.name}</strong>
              <small>{store.category}</small>
            </span>
          </span>

          {products.length ? (
            <span className="store-market-strip">
              {products.map((product) => (
                <span
                  aria-hidden="true"
                  className="stores-market-thumb"
                  key={product.slug}
                  style={{ backgroundImage: `url(${product.imageUrl})` }}
                />
              ))}
            </span>
          ) : null}

          <span className="store-market-meta">
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
              {store.views}
            </span>
          </span>
        </span>
      </Link>

      <span className="store-market-actions">
        <LeadWhatsAppLink
          className="button button-success store-market-action"
          phone={store.whatsappNumber}
          source="stores-market-card"
          storeId={store.id}
          storeName={store.name}
        >
          <MessageCircle size={16} />
          <span className="store-market-action-label">Yaz</span>
        </LeadWhatsAppLink>
        <Link className="button store-market-action" href={`/stores/${store.slug}`}>
          <span className="store-market-action-label">Bax</span>
          <ArrowRight size={15} />
        </Link>
      </span>
    </article>
  );
}
