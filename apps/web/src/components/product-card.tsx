import Link from 'next/link';
import { Eye, MapPin, MessageCircle, PackageCheck, Store } from 'lucide-react';
import { LeadWhatsAppLink } from './lead-actions';
import type { ProductPreview } from '../lib/catalog-data';

type ProductCardProps = {
  product: ProductPreview;
  variant?: 'default' | 'compact';
};

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const isCompact = variant === 'compact';

  return (
    <article className={isCompact ? 'card product-card product-card-compact' : 'card product-card'}>
      <Link className="product-image-frame" href={`/products/${product.slug}`} aria-label={`${product.title} bax`}>
        <span
          className="product-photo"
          role="img"
          aria-label={product.imageAlt}
          style={{ backgroundImage: `url(${product.imageUrl})` }}
        />
        <span className="product-image-shade" aria-hidden="true" />
        <span className="product-badge">{product.badge}</span>
      </Link>

      <div className="product-body">
        <div className="product-kicker">{product.category}</div>
        <Link className="product-title" href={`/products/${product.slug}`}>
          {product.title}
        </Link>

        <div className="price-row">
          <span className="price">{product.price}</span>
          <span className="min-order">
            <PackageCheck size={14} />
            {product.minOrder}
          </span>
        </div>

        <div className="card-meta product-meta">
          <span>
            <Store size={14} /> {product.store}
          </span>
          <span>
            <MapPin size={14} /> {product.city}
          </span>
        </div>

        <div className="product-actions">
          <LeadWhatsAppLink
            className="button button-success"
            phone={product.whatsappNumber}
            productId={product.id}
            productTitle={product.title}
            source="product-card"
            storeId={product.storeId}
            storeName={product.store}
          >
            <MessageCircle size={17} />
            {isCompact ? 'Yaz' : 'WhatsApp'}
          </LeadWhatsAppLink>
          <Link className="button" href={`/products/${product.slug}`} aria-label={`${product.title} bax`}>
            <Eye size={17} />
            Bax
          </Link>
        </div>
      </div>
    </article>
  );
}
