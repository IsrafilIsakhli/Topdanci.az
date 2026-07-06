import { Package, Search } from 'lucide-react';
import { ProductCard } from '../../components/product-card';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { getProducts } from '../../lib/catalog-data';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; city?: string }>;
}) {
  const query = await searchParams;
  const products = await getProducts({
    q: query?.q,
    category: query?.category,
    city: query?.city,
    limit: 48,
  });

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
            <select className="button" aria-label="Sırala" defaultValue="newest">
              <option value="newest">Ən yenilər</option>
              <option value="popular">Populyar</option>
            </select>
          </div>

          <form action="/products" className="catalog-search-panel products-search-panel">
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
            <span>{products.length} məhsul göstərilir</span>
          </div>

          <div className="grid product-grid product-market-grid product-list-view">
            {products.length ? (
              products.map((product) => <ProductCard key={product.slug} product={product} variant="compact" />)
            ) : (
              <p className="empty-state">Axtarışa uyğun aktiv məhsul tapılmadı.</p>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
