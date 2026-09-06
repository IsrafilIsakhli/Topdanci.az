import Link from 'next/link';
import { ArrowRight, MapPin, Sparkles, Store as StoreIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ProductPreview } from '../lib/catalog-data';

type CategoryStripProps = {
  eyebrow: string;
  title: string;
  categorySlug: string;
  icon: LucideIcon;
  products: ProductPreview[];
};

export function CategoryStrip({ eyebrow, title, categorySlug, icon: Icon, products }: CategoryStripProps) {
  if (!products.length) return null;

  return (
    <section className="section product-strip-section">
      <div className="container">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">
              <Icon size={14} />
              {eyebrow}
            </p>
            <h2>{title}</h2>
          </div>
          <Link className="card-link" href={`/products?category=${categorySlug}`}>
            Hamısına bax <ArrowRight size={14} />
          </Link>
        </div>
      </div>
      <div className="container product-strip-viewport">
        <div className="product-strip-track">
          {products.map((product) => {
            const bestTier = product.priceTiers?.[product.priceTiers.length - 1];
            return (
              <Link className="mini-product-card" href={`/products/${product.slug}`} key={product.slug}>
                <span aria-hidden="true" className="mini-thumb" style={{ backgroundImage: `url(${product.imageUrl})` }}>
                  {product.badge ? <span className="mini-flag">{product.badge}</span> : null}
                  {bestTier ? (
                    <span className="mini-price">
                      <Sparkles size={11} />
                      {bestTier.price}
                    </span>
                  ) : null}
                </span>
                <span className="mini-body">
                  <strong>{product.title}</strong>
                  <small className="mini-store">
                    <StoreIcon size={11} />
                    {product.store}
                  </small>
                  <small className="mini-city">
                    <MapPin size={11} />
                    {product.city} · {product.minOrder}
                  </small>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}