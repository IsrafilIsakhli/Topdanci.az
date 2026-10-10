import Link from 'next/link';
import { ArrowRight, BadgeCheck, MapPin, Package, TrendingUp } from 'lucide-react';
import type { ProductPreview, StorePreview } from '../lib/catalog-data';
import { storeAccent } from '../lib/store-accent';

type StoresShowcaseProps = {
  stores: StorePreview[];
  productsByStore: Map<string, ProductPreview[]>;
};

/** "Həftənin mağazaları" vitrin bölməsi. */
export function StoresShowcase({ stores, productsByStore }: StoresShowcaseProps) {
  return (
    <section className="section stores-showcase-section">
      <div className="container">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Vitrin</p>
            <h2>Həftənin mağazaları</h2>
          </div>
          <Link className="card-link" href="/stores">
            Bütün mağazalar <ArrowRight size={15} />
          </Link>
        </div>

        <div className="stores-showcase-grid">
          {stores.map((store) => {
            const strip = productsByStore.get(store.slug) ?? [];
            const accent = storeAccent(store.slug);
            return (
              <Link className="stores-showcase-card" href={`/stores/${store.slug}`} key={store.slug}>
                <span
                  className="stores-showcase-cover"
                  style={{ backgroundImage: `url(${store.coverImageUrl})`, backgroundColor: accent.bg }}
                >
                  <span className="stores-showcase-tag">
                    <TrendingUp size={13} />
                    Vitrin mağazası
                  </span>
                </span>
                <span className="stores-showcase-body">
                  <span className="stores-showcase-head">
                    <span className="store-avatar" style={{ backgroundColor: accent.bg, color: accent.fg }}>
                      {store.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span>
                      <strong>{store.name}</strong>
                      <small>
                        {store.category} · {store.city}
                      </small>
                    </span>
                    {store.verified ? (
                      <em>
                        <BadgeCheck size={13} />
                        Təsdiqli
                      </em>
                    ) : null}
                  </span>
                  {strip.length ? (
                    <span className="stores-showcase-strip">
                      {strip.map((product) => (
                        <span
                          aria-hidden="true"
                          className="stores-showcase-thumb"
                          key={product.slug}
                          style={{ backgroundImage: `url(${product.imageUrl})` }}
                        />
                      ))}
                      <span className="stores-showcase-more">{store.productCount} məhsul</span>
                    </span>
                  ) : null}
                  <span className="stores-showcase-meta">
                    <span>
                      <Package size={14} />
                      {store.productCount} məhsul
                    </span>
                    <span>
                      <MapPin size={14} />
                      {store.city}
                    </span>
                    <span>
                      <TrendingUp size={14} />
                      {store.views}
                    </span>
                  </span>
                  <span className="card-link stores-showcase-action">
                    Vitrinə bax <ArrowRight size={15} />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
