import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CategoryCard, ProductPreview, StorePreview } from '../lib/catalog-data';
import { categoryRoute } from '../lib/routes';
import { StoreMarketCard } from './store-market-card';

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
            rows.map(({ store, strip }) => (
              <StoreMarketCard
                key={store.slug}
                products={strip}
                sponsored={sponsored.has(store.slug)}
                store={store}
              />
            ))
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
