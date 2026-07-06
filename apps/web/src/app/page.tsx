import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Crown,
  Megaphone,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';
import { CategorySearchForm, type CategorySearchItem } from '../components/category-search-form';
import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';
import { getCategories, getProducts, getStores, heroImage, stats } from '../lib/catalog-data';

export default async function HomePage() {
  const [categories, allCategories, products, stores] = await Promise.all([
    getCategories({ rootsOnly: true }),
    getCategories(),
    getProducts({ limit: 8 }),
    getStores({ limit: 6 }),
  ]);
  const categorySearchItems: CategorySearchItem[] = allCategories.map(({ id, parentId, slug, name }) => ({
    id,
    parentId,
    slug,
    name,
  }));
  const premiumStores = stores.slice(0, 6);
  const featuredProducts = products.slice(0, 8);
  const spotlightCategories = categories.slice(0, 8);

  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="home-hero home-hero-premium">
        <div className="home-hero-aura" aria-hidden="true" />
        <div className="container home-hero-premium-grid">
          <div className="home-hero-copy">
            <h1>Topdansatıcı mağazaları və məhsulları bir yerdə kəşf edin</h1>
            <p className="lead">
              Alıcılar məhsulları araşdırır, mağazaları yoxlayır və satıcı ilə WhatsApp və telefon üzərindən birbaşa əlaqə saxlayır.
              Platforma satış aparmır, etibarlı əlaqəni sürətləndirir.
            </p>

            <CategorySearchForm categories={categorySearchItems} />

            <div className="home-trust-row premium-trust-row">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div className="home-trust-item premium-trust-item" key={stat.label}>
                    <Icon size={18} />
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="home-hero-showcase" aria-label="TopdanBazar platforma vitrin nümunəsi">
            <div className="hero-showcase-image" style={{ backgroundImage: `url(${heroImage})` }}>
              <span className="sponsored-pill hero-pill">
                <Crown size={13} />
                Premium tərəfdaş
              </span>
              <div className="hero-showcase-card">
                <span>Canlı kataloq</span>
                <strong>200K+ məhsul seçimi</strong>
                <small>Aktiv mağazalar və yeni təkliflər</small>
              </div>
            </div>
            <div className="hero-mini-grid">
              <div className="hero-mini-card">
                <TrendingUp size={18} />
                <strong>Önə çıxan vitrin</strong>
                <span>Reklam yerləri şəffaf göstərilir</span>
              </div>
              <div className="hero-mini-card">
                <MessageCircle size={18} />
                <strong>Birbaşa əlaqə</strong>
                <span>WhatsApp və telefon yönləndirməsi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section category-strip premium-category-strip">
        <div className="container">
          <div className="category-ribbon">
            {spotlightCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link className="category-ribbon-item" key={category.slug} href={`/categories/${category.slug}`}>
                  <span>
                    <Icon size={19} />
                  </span>
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section sponsored-section">
        <div className="container">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Premium tərəfdaşlar</p>
              <h2>Önə çıxan mağazalar</h2>
            </div>
            <Link className="card-link" href="/stores">
              Bütün mağazalara bax <ArrowRight size={14} />
            </Link>
          </div>

          <div className="premium-store-grid">
            {premiumStores.length ? (
              premiumStores.map((store, index) => (
                <Link className="premium-store-card" href={`/stores/${store.slug}`} key={store.slug}>
                  <div className="premium-store-cover" style={{ backgroundImage: `url(${store.coverImageUrl})` }}>
                    <span className="sponsored-pill">
                      <Megaphone size={13} />
                      Sponsorlu
                    </span>
                  </div>
                  <div className="premium-store-body">
                    <div className="premium-store-head">
                      <span className="store-avatar">{store.name.slice(0, 2).toUpperCase()}</span>
                      <span className="verified-pill">
                        <BadgeCheck size={14} />
                        Təsdiqlənmiş
                      </span>
                    </div>
                    <strong>{store.name}</strong>
                    <span className="card-meta">{store.category}</span>
                    <div className="store-metric-row">
                      <span>{store.productCount} məhsul</span>
                      <span>{store.city}</span>
                      <span>{index === 0 ? 'Vitrin #1' : `${store.views} baxış`}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="empty-state">Hazırda göstəriləcək mağaza yoxdur.</p>
            )}
          </div>
        </div>
      </section>

      <section className="section section-muted featured-products-band">
        <div className="container">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Vitrin</p>
              <h2>Önə çıxan məhsullar</h2>
            </div>
            <Link className="card-link" href="/products">
              Bütün məhsullar <ArrowRight size={14} />
            </Link>
          </div>
          <div className="featured-product-grid sponsored-product-grid">
            {featuredProducts.length ? (
              featuredProducts.map((product, index) => (
                <Link className="sponsored-product-card" href={`/products/${product.slug}`} key={product.slug}>
                  <span className="sponsored-product-thumb" style={{ backgroundImage: `url(${product.imageUrl})` }}>
                    <span>{index < 3 ? 'Ödənişli' : 'Vitrin'}</span>
                  </span>
                  <span className="sponsored-product-info">
                    <small>{product.category}</small>
                    <strong>{product.title}</strong>
                    <em>{product.price}</em>
                    <span>{product.store} · {product.city}</span>
                  </span>
                </Link>
              ))
            ) : (
              <p className="empty-state">Hazırda göstəriləcək məhsul yoxdur.</p>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
