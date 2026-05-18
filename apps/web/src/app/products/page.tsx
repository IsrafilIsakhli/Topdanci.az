import { ProductCard } from '../../components/product-card';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { products } from '../../lib/catalog-data';

export default function ProductsPage() {
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
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
