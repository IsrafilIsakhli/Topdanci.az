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
              <h1>Mehsullar</h1>
              <p className="lead">Topdansatis mehsullari arashdirin ve satici ile birbasa elaqe saxlayin.</p>
            </div>
            <select className="button" aria-label="Sirala">
              <option>En yeniler</option>
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
