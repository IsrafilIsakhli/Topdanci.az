import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { getCategories } from '../../lib/catalog-data';

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const query = await searchParams;
  const categories = await getCategories({ q: query?.q, rootsOnly: true });

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container">
          <div className="section-title-row">
            <div>
              <h1>Kateqoriyalar</h1>
              <p className="lead">Son elanlar üzrə baş kateqoriyaları və alt bölmələri kəşf edin.</p>
            </div>
          </div>

          <form className="search-panel" action="/categories">
            <input name="q" placeholder="Kateqoriya axtarın" />
            <button className="button button-primary" type="submit">
              Axtar
            </button>
          </form>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <h2>Bütün kateqoriyalar</h2>
          <div className="grid category-tree-grid" style={{ marginTop: 24 }}>
            {categories.length ? categories.map((category) => {
              const Icon = category.icon;
              const visibleChildren = category.children?.slice(0, 2) ?? [];
              const hiddenChildrenCount = Math.max((category.children?.length ?? 0) - visibleChildren.length, 0);

              return (
                <Link className="card category-card" key={category.slug} href={`/categories/${category.slug}`}>
                  <span className="icon-badge category-card-icon">
                    <Icon size={20} />
                  </span>
                  <span className="category-card-content">
                    <strong>{category.name}</strong>
                    <span className="card-meta">
                      {category.productCount} məhsul · {category.storeCount} mağaza
                    </span>
                    {visibleChildren.length ? (
                      <span className="category-children">
                        {visibleChildren.map((child) => (
                          <span key={child}>{child}</span>
                        ))}
                        {hiddenChildrenCount > 0 ? <span className="category-overflow-chip">+{hiddenChildrenCount} alt kateqoriya</span> : null}
                      </span>
                    ) : null}
                  </span>
                  <span className="card-link category-card-action">
                    <span>Kateqoriyaya bax</span>
                    <ArrowRight size={14} />
                  </span>
                </Link>
              );
            }) : <p className="empty-state">Axtarışa uyğun kateqoriya tapılmadı.</p>}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
