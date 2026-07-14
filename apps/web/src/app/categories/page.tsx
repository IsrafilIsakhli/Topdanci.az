import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { getCategories } from '../../lib/catalog-data';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await getCategories({ rootsOnly: true });

  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="section categories-simple-hero-section">
        <div className="container categories-simple-hero">
          <p className="eyebrow">Kateqoriya seçimi</p>
          <h1>Əsas kateqoriyalar</h1>
          <p className="lead">Alıcılar əvvəlcə sektor seçir, sonra həmin kateqoriyadakı mağaza və məhsullara baxır.</p>
        </div>
      </section>

      <section className="section section-muted categories-list-section">
        <div className="container">
          <div className="section-title-row categories-list-title">
            <div>
              <p className="eyebrow">Sektorlar</p>
              <h2>Kateqoriyanı seçin</h2>
            </div>
            <span>{categories.length} əsas sektor</span>
          </div>

          <div className="grid category-tree-grid category-market-grid">
            {categories.length ? (
              categories.map((category) => {
                const Icon = category.icon;
                const visibleChildren = category.childCategories ?? category.children?.map((name) => ({ name, slug: category.slug })) ?? [];

                return (
                  <article className="card category-card category-market-card category-main-card" key={category.slug}>
                    <span className="icon-badge category-card-icon">
                      <Icon size={22} />
                    </span>
                    <span className="category-card-content">
                      <strong>{category.name}</strong>
                      <span className="card-meta">
                        {category.productCount} məhsul · {category.storeCount} mağaza
                      </span>
                    </span>
                    {visibleChildren.length ? (
                      <span className="category-children category-main-children">
                        {visibleChildren.map((child) => (
                          <Link className="category-child-chip" href={`/categories/${child.slug}`} key={child.slug}>
                            {child.name}
                          </Link>
                        ))}
                      </span>
                    ) : null}
                    <Link className="card-link category-card-action" href={`/categories/${category.slug}`}>
                      Kateqoriyaya bax <ArrowRight size={14} />
                    </Link>
                  </article>
                );
              })
            ) : (
              <p className="empty-state">Hazırda göstəriləcək kateqoriya yoxdur.</p>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
