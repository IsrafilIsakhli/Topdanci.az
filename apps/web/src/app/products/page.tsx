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
      <section className="section">
        <div className="container">
          <div className="section-title-row">
            <div>
              <h1>Məhsullar</h1>
              <p className="lead">Topdansatış məhsulları araşdırın və satıcı ilə birbaşa əlaqə saxlayın.</p>
            </div>
            <select className="button" aria-label="Sırala">
              <option>Ən yenilər</option>
              <option>Populyar</option>
            </select>
          </div>
          <div className="grid product-grid">
            {products.length ? products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            )) : <p className="empty-state">Axtarışa uyğun aktiv məhsul tapılmadı.</p>}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
