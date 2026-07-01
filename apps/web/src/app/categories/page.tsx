import Link from 'next/link';
import { ArrowRight, Layers3, Package, Search, Store, Tags } from 'lucide-react';
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
  const totalProducts = categories.reduce((sum, category) => sum + toNumber(category.productCount), 0);
  const totalStores = categories.reduce((sum, category) => sum + toNumber(category.storeCount), 0);
  const totalChildren = categories.reduce(
    (sum, category) => sum + (category.childCategories?.length ?? category.children?.length ?? 0),
    0,
  );
  const featuredCategories = categories.slice(0, 6);

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section categories-hero-section">
        <div className="container categories-hero-grid">
          <div className="categories-hero-copy">
            <p className="eyebrow">
              <Layers3 size={15} />
              Kataloq naviqasiyası
            </p>
            <h1>Topdansatış sektorları</h1>
            <p className="lead">
              Alıcılar üçün əsas sahələri, alt bölmələri və aktiv mağazaları bir yerdə səliqəli şəkildə kəşf edin.
            </p>
            <div className="category-page-stats" aria-label="Kateqoriya xülasəsi">
              <span>
                <Tags size={16} />
                <strong>{categories.length}</strong>
                sektor
              </span>
              <span>
                <Layers3 size={16} />
                <strong>{totalChildren}</strong>
                alt bölmə
              </span>
              <span>
                <Package size={16} />
                <strong>{totalProducts}</strong>
                məhsul
              </span>
              <span>
                <Store size={16} />
                <strong>{totalStores}</strong>
                mağaza
              </span>
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

      {featuredCategories.length ? (
        <section className="category-quick-strip-section">
          <div className="container">
            <div className="category-quick-strip" aria-label="Tez sektor seçimi">
              {featuredCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Link className="category-quick-item" href={`/categories/${category.slug}`} key={category.slug}>
                    <span>
                      <Icon size={18} />
                    </span>
                    <strong>{category.name}</strong>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section section-muted categories-list-section">
        <div className="container">
          <div className="section-title-row categories-list-title">
            <div>
              <p className="eyebrow">Bütün bölmələr</p>
              <h2>Kateqoriya kataloqu</h2>
            </div>
            <span>{categories.length} əsas sektor</span>
          </div>

          <div className="grid category-tree-grid category-market-grid">
            {categories.length ? (
              categories.map((category) => {
                const Icon = category.icon;
                const visibleChildren = category.childCategories ?? category.children?.map((name) => ({ name, slug: category.slug })) ?? [];

                return (
                  <article className="card category-card category-market-card" key={category.slug}>
                    <div className="category-card-top">
                      <span className="icon-badge category-card-icon">
                        <Icon size={20} />
                      </span>
                      <span className="category-card-counts">
                        <span>
                          <Package size={13} />
                          {category.productCount} məhsul
                        </span>
                        <span>
                          <Store size={13} />
                          {category.storeCount} mağaza
                        </span>
                      </span>
                    </div>

                    <div className="category-card-content">
                      <strong>{category.name}</strong>
                      <p>
                        {visibleChildren.length
                          ? `${visibleChildren.length} alt bölmə üzrə məhsul və satıcıları araşdırın.`
                          : 'Bu sektorda yeni mağaza və məhsullar əlavə olunduqca burada görünəcək.'}
                      </p>
                    </div>

                    {visibleChildren.length ? (
                      <div className="category-children category-child-list">
                        {visibleChildren.map((child) => (
                          <Link className="category-child-chip" key={child.slug} href={`/categories/${child.slug}`}>
                            <span>{child.name}</span>
                            <ArrowRight size={12} />
                          </Link>
                        ))}
                      </div>
                    ) : null}

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

function toNumber(value: string) {
  const number = Number.parseInt(value.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(number) ? number : 0;
}
