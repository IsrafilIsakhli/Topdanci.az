import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Package, Search } from 'lucide-react';
import { ProductCard } from '../../components/product-card';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { getProductsPage, type ProductSort } from '../../lib/catalog-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Topdansatış məhsulları',
  description: 'Azərbaycan üzrə topdansatış məhsullarını qiymət, şəhər və kateqoriyaya görə araşdırın.',
  alternates: { canonical: '/products' },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; city?: string; cursor?: string; sort?: string }>;
}) {
  const query = await searchParams;
  const sort = normalizeProductSort(query?.sort);
  const page = await getProductsPage({
    q: query?.q,
    category: query?.category,
    city: query?.city,
    cursor: query?.cursor,
    sort,
    limit: 24,
  });
  const products = page.items;

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section products-hero-section">
        <div className="container">
          <div className="section-title-row products-title-row">
            <div>
              <p className="eyebrow">
                <Package size={15} />
                Məhsul kataloqu
              </p>
              <h1>Məhsullar</h1>
              <p className="lead">Topdansatış məhsullarını daha rahat müqayisə edin və satıcı ilə birbaşa əlaqə saxlayın.</p>
            </div>
            <select className="button" aria-label="Sırala" defaultValue={sort} form="products-filter-form" name="sort">
              <option value="newest">Ən yenilər</option>
              <option value="popular">Populyar</option>
              <option value="price_asc">Qiymət: artan</option>
              <option value="price_desc">Qiymət: azalan</option>
            </select>
          </div>

          <form action="/products" className="catalog-search-panel products-search-panel" id="products-filter-form">
            <label>
              <Search size={18} />
              <input defaultValue={query?.q ?? ''} name="q" placeholder="Məhsul, mağaza və ya kateqoriya axtarın" />
            </label>
            <input defaultValue={query?.city ?? ''} name="city" placeholder="Şəhər" />
            {query?.category ? <input name="category" type="hidden" value={query.category} /> : null}
            <button className="button button-primary" type="submit">
              Axtar
            </button>
          </form>
        </div>
      </section>

      <section className="section section-muted products-list-section">
        <div className="container">
          <div className="section-title-row products-list-title">
            <div>
              <p className="eyebrow">Aktiv elanlar</p>
              <h2>Məhsul vitrinləri</h2>
            </div>
            <span>{page.meta.total} məhsul tapıldı</span>
          </div>

          <div className="grid product-grid product-market-grid product-list-view">
            {products.length ? (
              products.map((product) => <ProductCard key={product.slug} product={product} variant="compact" />)
            ) : (
              <p className="empty-state">Axtarışa uyğun aktiv məhsul tapılmadı.</p>
            )}
          </div>
          {page.meta.nextCursor ? (
            <div className="catalog-pagination">
              <Link className="button" href={buildProductsHref(query, page.meta.nextCursor, sort)}>
                Daha çox məhsul <ArrowRight size={16} />
              </Link>
            </div>
          ) : null}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function normalizeProductSort(value?: string): ProductSort {
  return value === 'popular' || value === 'price_asc' || value === 'price_desc' ? value : 'newest';
}

function buildProductsHref(
  query: { q?: string; category?: string; city?: string } | undefined,
  cursor: string,
  sort: ProductSort,
) {
  const params = new URLSearchParams();
  if (query?.q) params.set('q', query.q);
  if (query?.category) params.set('category', query.category);
  if (query?.city) params.set('city', query.city);
  if (sort !== 'newest') params.set('sort', sort);
  params.set('cursor', cursor);
  return `/products?${params.toString()}`;
}
