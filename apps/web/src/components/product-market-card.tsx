import Link from 'next/link';
import { MapPin, MessageCircle, PackageCheck } from 'lucide-react';
import { LeadWhatsAppLink } from './lead-actions';
import type { ProductPreview } from '../lib/catalog-data';
import { storeAccent } from '../lib/store-accent';

type ProductMarketCardProps = {
  product: ProductPreview;
};

export function ProductMarketCard({ product }: ProductMarketCardProps) {
  const accent = storeAccent(product.storeSlug ?? product.slug);

  return (
    <article className="card product-market-card">
      <Link
        className="product-market-cover"
        href={`/products/${product.slug}`}
        aria-label={`${product.title} — ətraflı bax`}
      >
        <span
          className="product-market-photo"
          role="img"
          aria-label={product.imageAlt}
          style={{ backgroundImage: `url(${product.imageUrl})` }}
        />
        <span className="product-market-badge">{product.badge}</span>
      </Link>

      <div className="product-market-body">
        <p className="product-market-kicker">{product.category}</p>
        <Link className="product-market-title" href={`/products/${product.slug}`}>
          {product.title}
        </Link>

        {product.priceTiers?.length ? (
          <span className="tier-ladder product-market-tiers">
            {product.priceTiers.map((tier, tierIndex) => (
              <span
                className={tierIndex === product.priceTiers!.length - 1 ? 'tier-row tier-best' : 'tier-row'}
                key={tier.qty}
              >
                <small>{tier.qty}</small>
                <em>{tier.price}</em>
              </span>
            ))}
          </span>
        ) : (
          <p className="product-market-price">{product.price}</p>
        )}

        <span className="product-market-min">
          <PackageCheck size={13} />
          {product.minOrder}
        </span>

        <div className="product-market-store">
          <span className="store-avatar" style={{ backgroundColor: accent.bg, color: accent.fg }}>
            {product.store.slice(0, 2).toUpperCase()}
          </span>
          <span>
            <strong>{product.store}</strong>
            <small>
              <MapPin size={11} />
              {product.city}
            </small>
          </span>
        </div>

        <div className="product-market-actions">
          <LeadWhatsAppLink
            className="button button-success"
            phone={product.whatsappNumber}
            productId={product.id}
            productTitle={product.title}
            source="product-market-card"
            storeId={product.storeId}
            storeName={product.store}
          >
            <MessageCircle size={15} />
            Yaz
          </LeadWhatsAppLink>
          <Link className="button" href={`/products/${product.slug}`} aria-label={`${product.title} ətraflı bax`}>
            Ətraflı
          </Link>
        </div>
      </div>
    </article>
  );
}
