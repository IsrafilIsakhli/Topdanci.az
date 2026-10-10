import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Filter, Package, Search, ShieldCheck, Truck, X } from 'lucide-react';
import { CatalogSortSelect } from '../../components/catalog-sort-select';
import { JsonLd } from '../../components/json-ld';
import { ProductMarketCard } from '../../components/product-market-card';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { getCategories, getProductsPage } from '../../lib/catalog-data';
import { absoluteUrl } from '../../lib/site-url';
import {
  SORT_OPTIONS,
  buildActiveFilters,
  buildProductsHref,
  normalizeProductSort,
  normalizeStock,
  toOptionalNumber,
  type ProductsSearchQuery,
} from './products-filters';

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
  const [page, categories] = await Promise.all([
    getProductsPage({
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
    }),
    getCategories({ rootsOnly: true }),
  ]);
  const products = page.items;
  const activeFilters = buildActiveFilters(query, sort, categories);

  const productListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Topdansatış məhsulları',
    numberOfItems: page.meta.total,
    itemListElement: products.slice(0, 20).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.title,
      url: absoluteUrl(`/products/${product.slug}`),
    })),
  };

  return (
    <main className="site-shell">
      <SiteHeader />
      <JsonLd data={productListJsonLd} />

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
            <CatalogSortSelect
              ariaLabel="Sırala"
              form="products-filter-form"
              name="sort"
              options={SORT_OPTIONS}
              value={sort}
            />
          </div>

          <div className="products-trust-bar" aria-label="Kataloq zəmanətləri">
            <span>
              <ShieldCheck size={16} />
              <strong>{page.meta.total}</strong> aktiv topdan elan
            </span>
            <span>
              <Truck size={16} />
              Ölkə üzrə topdan çatdırılma
            </span>
            <span>
              <BadgeCheck size={16} />
              Birbaşa satıcı əlaqəsi
            </span>
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

          {activeFilters.length ? (
            <div className="products-active-filters" aria-label="Aktiv filtrlər">
              {activeFilters.map((filter) => (
                <Link className="products-filter-chip" href={filter.href} key={filter.key}>
                  {filter.icon}
                  {filter.label}
                  <X size={13} />
                </Link>
              ))}
              <Link className="products-filter-clear" href="/products">
                Hamısını təmizlə
              </Link>
            </div>
          ) : null}

          {categories.length ? (
            <div className="products-category-row" aria-label="Kateqoriyalar üzrə göstər">
              <Link
                className={query?.category ? 'products-category-chip' : 'products-category-chip active'}
                href="/products"
              >
                Bütün kateqoriyalar
              </Link>
              {categories.map((category) => (
                <Link
                  className={query?.category === category.slug ? 'products-category-chip active' : 'products-category-chip'}
                  href={`/products?category=${encodeURIComponent(category.slug)}`}
                  key={category.slug}
                >
                  {category.name}
                  {category.productCount !== '0' ? <small>{category.productCount}</small> : null}
                </Link>
              ))}
            </div>
          ) : null}
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

          <div className="products-market-grid">
            {products.length ? (
              products.map((product) => <ProductMarketCard key={product.slug} product={product} />)
            ) : (
              <p className="empty-state">Axtarışa uyğun aktiv məhsul tapılmadı.</p>
            )}
          </div>
          {page.meta.nextCursor ? (
            <div className="catalog-pagination">
              <Link className="button" href={buildProductsHref(query, sort, { cursor: page.meta.nextCursor })}>
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
