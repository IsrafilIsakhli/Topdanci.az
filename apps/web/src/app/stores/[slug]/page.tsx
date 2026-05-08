import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MessageSquare, Phone, Store } from 'lucide-react';
import { ProductCard } from '../../../components/product-card';
import { SiteFooter } from '../../../components/site-footer';
import { SiteHeader } from '../../../components/site-header';
import { products, stores } from '../../../lib/catalog-data';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function StoreDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const store = stores.find((item) => item.slug === slug);

  if (!store) {
    notFound();
  }

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container">
          <div className="hero-visual" style={{ minHeight: 260 }} aria-hidden="true" />
          <div className="section-title-row" style={{ marginTop: 28 }}>
            <div>
              <p className="card-link">Tesdiqlenmis magaza</p>
              <h1>{store.name}</h1>
              <p className="lead">
                {store.category} · {store.city} · {store.productCount} mehsul
              </p>
            </div>
            <div className="header-actions" style={{ display: 'flex' }}>
              <button className="button" type="button">
                <Phone size={17} />
                Telefonu goster
              </button>
              <Link className="button button-success" href="/contact">
                <MessageSquare size={17} />
                WhatsApp ile elaqe
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="section section-muted">
        <div className="container">
          <h2>Butun Mehsullar</h2>
          <div className="grid product-grid" style={{ marginTop: 24 }}>
            {products.map((product) => (
              <ProductCard key={product.slug} product={{ ...product, store: store.name }} />
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container panel">
          <Store color="#064e3b" />
          <h2>Magaza haqqinda</h2>
          <p className="lead">
            Magaza profili alicilarin birbasa elaqe saxlamasi ucun hazirlanir. Burada satis, checkout
            ve odeme prosesi yoxdur.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
