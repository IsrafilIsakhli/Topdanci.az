import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductCard } from '../../../components/product-card';
import { SiteFooter } from '../../../components/site-footer';
import { SiteHeader } from '../../../components/site-header';
import { getCategory, getProducts } from '../../../lib/catalog-data';
import { absoluteUrl } from '../../../lib/site-url';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) {
    return { title: 'Kateqoriya tapılmadı', robots: { index: false, follow: false } };
  }

  const description = `${category.name} üzrə topdansatış məhsullarını və aktiv mağazaları kəşf edin.`;
  return {
    title: category.name,
    description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: {
      type: 'website',
      title: category.name,
      description,
      url: absoluteUrl(`/categories/${category.slug}`),
    },
  };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const products = await getProducts({ category: category.slug, limit: 48 });

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
            {category.name} üzrə topdansatış məhsullarını, alt kateqoriyaları və aktiv mağazaları kəşf edin.
          </p>
          {category.children?.length ? (
            <div className="category-children category-detail-children">
              {category.children.map((child) => (
                <span key={child}>{child}</span>
              ))}
            </div>
          ) : null}
        </div>
      </section>
      <section className="section section-muted">
        <div className="container grid product-grid">
          {products.length ? (
            products.map((product) => <ProductCard key={product.slug} product={product} />)
          ) : (
            <p className="empty-state">Bu kateqoriyada aktiv məhsul tapılmadı.</p>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
