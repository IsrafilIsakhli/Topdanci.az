import Link from 'next/link';
import { Eye, MessageSquare, MapPin, Store } from 'lucide-react';

type ProductCardProps = {
  product: {
    slug: string;
    title: string;
    store: string;
    city: string;
    price: string;
    art: string;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="card product-card">
      <div className={`product-art ${product.art}`} aria-hidden="true" />
      <div className="product-body">
        <div>
          <div className="product-title">{product.title}</div>
          <div className="price">{product.price}</div>
        </div>

        <div className="card-meta">
          <div>
            <Store size={14} /> {product.store}
          </div>
          <div>
            <MapPin size={14} /> {product.city}
          </div>
        </div>

        <div className="product-actions">
          <Link className="button button-success" href={`/products/${product.slug}`}>
            <MessageSquare size={17} />
            WhatsApp
          </Link>
          <Link className="button" href={`/products/${product.slug}`} aria-label={`${product.title} bax`}>
            <Eye size={17} />
            Bax
          </Link>
        </div>
      </div>
    </article>
  );
}
