import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
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
              <p className="lead">
                Son elanlar üzrə baş kateqoriyaları və alt bölmələri kəşf edin.
              </p>
            </div>
          </div>

          <form className="catalog-search-panel" action="/categories">
            <label className="catalog-search-field">
              <Search size={18} />
              <input name="q" defaultValue={query?.q ?? ''} placeholder="Kateqoriya axtarın" />
            </label>
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
            {categories.length ? (
              categories.map((category) => {
                const Icon = category.icon;
                const visibleChildren = category.childCategories ?? category.children?.map((name) => ({ name, slug: category.slug })) ?? [];

                return (
                  <article className="card category-card" key={category.slug}>
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
                            <Link className="category-child-chip" key={child.slug} href={`/categories/${child.slug}`}>
                              {child.name}
                            </Link>
                          ))}
                        </span>
                      ) : null}
                    </span>
                    <Link className="card-link category-card-action" href={`/categories/${category.slug}`}>
                      <span>Kateqoriyaya bax</span>
                      <ArrowRight size={14} />
                    </Link>
                  </article>
                );
              })
            ) : (
              <p className="empty-state">Axtarışa uyğun kateqoriya tapılmadı.</p>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
