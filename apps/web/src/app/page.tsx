import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { ProductCard } from '../components/product-card';
import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';
import { categories, products, stats, stores } from '../lib/catalog-data';

export default function HomePage() {
  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div>
              <p className="eyebrow">B2B topdansatis platformasi</p>
              <h1>Topdansatici magazalari ve mehsullari bir yerde kesf edin</h1>
              <p className="lead">
                Mehsullari arashdirin, magazalara baxin ve saticilarla birbasa elaqe saxlayin.
                Platform sadece dogru tedarukcu ile sizi qovushdurur.
              </p>
            </div>

            <form className="search-panel" action="/products">
              <select name="category" aria-label="Kateqoriya">
                <option>Butun kateqoriyalar</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input name="q" placeholder="Mehsul, magaza ve ya kateqoriya axtarin" />
              <button className="button button-primary" type="submit">
                <Search size={17} />
                Axtar
              </button>
            </form>

            <div className="metric-row">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div className="metric-chip" key={stat.label}>
                    <Icon size={15} />
                    <span>{stat.value}</span>
                    <span>{stat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hero-visual" aria-label="Topdansatis anbar vizuali">
            <div className="hero-visual-card">
              <strong>Etibarli magazalar</strong>
              <p className="card-meta">
                Aktiv profil, yoxlanilmis elaqe melumatlari ve olculen lead statistikasi.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="section-title-row">
            <h2>Populyar kateqoriyalar</h2>
            <Link className="card-link" href="/categories">
              Hamisina bax <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid category-grid">
            {categories.slice(0, 8).map((category) => {
              const Icon = category.icon;
              return (
                <Link className="card category-card" key={category.slug} href={`/categories/${category.slug}`}>
                  <div>
                    <span className="icon-badge">
                      <Icon size={20} />
                    </span>
                    <strong>{category.name}</strong>
                  </div>
                  <span className="card-meta">
                    {category.productCount} mehsul · {category.storeCount} magaza
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title-row">
            <h2>Yeni mehsullar</h2>
            <Link className="card-link" href="/products">
              Butun mehsullar <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid product-grid">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="section-title-row">
            <h2>Populyar magazalar</h2>
            <Link className="card-link" href="/stores">
              Butun magazalar <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid store-grid">
            {stores.map((store) => (
              <Link className="card store-card" href={`/stores/${store.slug}`} key={store.slug}>
                <div>
                  <span className="icon-badge">{store.name.slice(0, 2).toUpperCase()}</span>
                  <strong>{store.name}</strong>
                  <span className="card-meta">{store.category}</span>
                </div>
                <span className="card-meta">
                  {store.productCount} mehsul · {store.city}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <h2>Topdansatis magazanizi onlayn kataloqa elave edin</h2>
            <p className="lead">
              Mehsullarinizi sergileyin, alicilarin WhatsApp ve telefon kliklerini izleyin.
            </p>
            <Link className="button" href="/open-store">
              Magaza ac
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
