import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter } from '../../../components/site-footer';
import { SiteHeader } from '../../../components/site-header';
import { categories, products } from '../../../lib/catalog-data';
import { ProductCard } from '../../../components/product-card';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container">
          <p className="card-link">
            <Link href="/categories">Kateqoriyalar</Link>
          </p>
          <h1>{category.name}</h1>
          <p className="lead">
            {category.name} uzre topdansatis mehsullarini ve aktiv magazalari kesf edin.
          </p>
        </div>
      </section>
      <section className="section section-muted">
        <div className="container grid product-grid">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
