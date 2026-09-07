import Link from 'next/link';
import { ArrowRight, BadgeCheck, MapPin, MessageCircle, Package, TrendingUp } from 'lucide-react';
import { LeadWhatsAppLink } from './lead-actions';
import type { CategoryCard, ProductPreview, StorePreview } from '../lib/catalog-data';
import { categoryRoute } from '../lib/routes';
import { storeAccent } from '../lib/store-accent';

type StoresMarketListProps = {
  rows: Array<{ store: StorePreview; strip: ProductPreview[] }>;
  sponsored: Set<string>;
  categories: CategoryCard[];
  total: number;
  nextCursor?: string | null | undefined;
  moreHref: string;
};

/** "Aktiv satıcılar" kataloq bölməsi: çiplər + mağaza kartları + səhifələmə. */
export function StoresMarketList({ rows, sponsored, categories, total, nextCursor, moreHref }: StoresMarketListProps) {
  const stores = rows.map((row) => row.store);

  return (
    <section className="section section-muted stores-list-section">
      <div className="container">
        <div className="section-title-row stores-list-title">
          <div>
            <p className="eyebrow">Mağaza kataloqu</p>
            <h2>Aktiv satıcılar</h2>
          </div>
          <span>{total} mağaza tapıldı</span>
        </div>

        {categories.length ? (
          <div className="stores-category-chips" aria-label="Kateqoriya üzrə mağazalar">
            {categories.slice(0, 8).map((category) => {
              const matchedCount = stores.filter((store) => store.categorySlug === category.slug).length;
              const chipCount =
                category.storeCount && category.storeCount !== '0'
                  ? category.storeCount
                  : matchedCount > 0
                    ? String(matchedCount)
                    : null;
              return (
                <Link href={categoryRoute(category.slug)} key={category.slug}>
                  <category.icon size={15} />
                  {category.name}
                  {chipCount ? <small>{chipCount}</small> : null}
                </Link>
              );
            })}
            <Link href="/products">Bütün kateqoriyalar</Link>
          </div>
        ) : null}

        <div className="grid store-grid store-market-grid">
          {rows.length ? (
            rows.map(({ store, strip }) => {
              const accent = storeAccent(store.slug);
              return (
                <div className="card store-market-card" key={store.slug}>

                  <Link
                    className="store-market-link"
                    href={`/stores/${store.slug}`}
                    aria-label={`${store.name} mağazasına bax`}
                  >
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
                      {sponsored.has(store.slug) ? <em>Bu həftə</em> : null}
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
                      {strip.length ? (
                        <span className="store-market-strip">
                          {strip.map((product) => (
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
                      WhatsApp
                    </LeadWhatsAppLink>
                    <Link className="button store-market-action" href={`/stores/${store.slug}`}>
                      Mağazaya bax
                      <ArrowRight size={15} />
                    </Link>
                  </span>
                </div>
              );
            })
          ) : (
            <p className="empty-state">Axtarışa uyğun aktiv mağaza tapılmadı.</p>
          )}
        </div>

        {nextCursor ? (
          <div className="catalog-pagination">
            <Link className="button" href={moreHref}>
              Daha çox mağaza <ArrowRight size={16} />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
