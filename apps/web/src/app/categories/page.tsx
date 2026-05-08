import Link from 'next/link';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { categories } from '../../lib/catalog-data';

export default function CategoriesPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container">
          <div className="section-title-row">
            <div>
              <h1>Kateqoriyalar</h1>
              <p className="lead">Topdansatis mehsullarini kateqoriyalara gore kesf edin.</p>
            </div>
          </div>

          <form className="search-panel" action="/categories">
            <input name="q" placeholder="Kateqoriya axtarin" />
            <button className="button button-primary" type="submit">
              Axtar
            </button>
          </form>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <h2>Butun Kateqoriyalar</h2>
          <div className="grid category-grid" style={{ marginTop: 24 }}>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link className="card category-card" key={category.slug} href={`/categories/${category.slug}`}>
                  <div>
                    <span className="icon-badge">
                      <Icon size={20} />
                    </span>
                    <strong>{category.name}</strong>
                  </div>
                  <span className="card-link">Kateqoriyaya bax</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
