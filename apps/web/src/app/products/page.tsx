import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Filter, Package, Search } from 'lucide-react';
import { ProductCard } from '../../components/product-card';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { getCategories, getProductsPage, type ProductSort } from '../../lib/catalog-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Topdansatış məhsulları',
  description: 'Azərbaycan üzrə topdansatış məhsullarını qiymət, şəhər və kateqoriyaya görə araşdırın.',
  alternates: { canonical: '/products' },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<ProductsSearchQuery>;
}) {
  const query = await searchParams;
  const sort = normalizeProductSort(query?.sort);
  const [page, categories] = await Promise.all([getProductsPage({
    q: query?.q,
    category: query?.category,
    city: query?.city,
    cursor: query?.cursor,
    sort,
    limit: 24,
    priceMin: toOptionalNumber(query?.priceMin),
    priceMax: toOptionalNumber(query?.priceMax),
    minOrderMax: toOptionalNumber(query?.minOrderMax),
    verified: query?.verified === 'true',
    stock: normalizeStock(query?.stock),
  }), getCategories()]);
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
            <button className="button button-primary" type="submit">
              Axtar
            </button>
            <details className="catalog-advanced-filters">
              <summary>
                <Filter size={17} />
                Ətraflı filtr
              </summary>
              <div className="catalog-filter-grid">
                <label>
                  <span>Kateqoriya / alt kateqoriya</span>
                  <select defaultValue={query?.category ?? ''} name="category">
                    <option value="">Bütün kateqoriyalar</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>{category.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Minimum qiymət</span>
                  <input defaultValue={query?.priceMin ?? ''} min="0" name="priceMin" placeholder="0" type="number" />
                </label>
                <label>
                  <span>Maksimum qiymət</span>
                  <input defaultValue={query?.priceMax ?? ''} min="0" name="priceMax" placeholder="5000" type="number" />
                </label>
                <label>
                  <span>Maksimum minimum sifariş</span>
                  <input defaultValue={query?.minOrderMax ?? ''} min="0" name="minOrderMax" placeholder="100" type="number" />
                </label>
                <label>
                  <span>Stok vəziyyəti</span>
                  <select defaultValue={query?.stock ?? ''} name="stock">
                    <option value="">Bütün stok vəziyyətləri</option>
                    <option value="IN_STOCK">Stokda var</option>
                    <option value="LIMITED">Məhdud stok</option>
                    <option value="OUT_OF_STOCK">Stokda yoxdur</option>
                  </select>
                </label>
                <label className="catalog-filter-check">
                  <input defaultChecked={query?.verified === 'true'} name="verified" type="checkbox" value="true" />
                  <span>Yalnız təsdiqlənmiş mağazalar</span>
                </label>
              </div>
            </details>
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
  query: ProductsSearchQuery | undefined,
  cursor: string,
  sort: ProductSort,
) {
  const params = new URLSearchParams();
  if (query?.q) params.set('q', query.q);
  if (query?.category) params.set('category', query.category);
  if (query?.city) params.set('city', query.city);
  if (query?.priceMin) params.set('priceMin', query.priceMin);
  if (query?.priceMax) params.set('priceMax', query.priceMax);
  if (query?.minOrderMax) params.set('minOrderMax', query.minOrderMax);
  if (query?.verified) params.set('verified', query.verified);
  if (query?.stock) params.set('stock', query.stock);
  if (sort !== 'newest') params.set('sort', sort);
  params.set('cursor', cursor);
  return `/products?${params.toString()}`;
}

type ProductsSearchQuery = {
  q?: string;
  category?: string;
  city?: string;
  cursor?: string;
  sort?: string;
  priceMin?: string;
  priceMax?: string;
  minOrderMax?: string;
  verified?: string;
  stock?: string;
};

function toOptionalNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function normalizeStock(value?: string): 'IN_STOCK' | 'LIMITED' | 'OUT_OF_STOCK' | undefined {
  return value === 'IN_STOCK' || value === 'LIMITED' || value === 'OUT_OF_STOCK' ? value : undefined;
}
