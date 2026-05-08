import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MessageSquare, Phone, Store } from 'lucide-react';
import { SiteFooter } from '../../../components/site-footer';
import { SiteHeader } from '../../../components/site-header';
import { products } from '../../../lib/catalog-data';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container hero-grid">
          <div className={`hero-visual product-art ${product.art}`} aria-label={product.title} />
          <aside className="panel">
            <p className="card-link">Mehsul kodu: preview</p>
            <h1>{product.title}</h1>
            <p className="price">{product.price}</p>
            <div className="card-meta">
              <Store size={15} /> {product.store}
            </div>
            <div className="field-grid" style={{ marginTop: 24 }}>
              <Link className="button button-success button-full" href="/contact">
                <MessageSquare size={17} />
                WhatsApp ile yaz
              </Link>
              <button className="button button-full" type="button">
                <Phone size={17} />
                Telefonu goster
              </button>
            </div>
          </aside>
        </div>
      </section>
      <section className="section section-muted">
        <div className="container panel">
          <h2>Mehsul haqqinda</h2>
          <p className="lead">
            Bu sehife lead-generation mentiqi ile qurulur: alici mehsulu inceler, satici ile platformadan
            kenarda WhatsApp ve ya telefon uzerinden elaqe saxlayir.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
