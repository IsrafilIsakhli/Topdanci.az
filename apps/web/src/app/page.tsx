import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Crown,
  Megaphone,
  MessageCircle,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
import { ProductCard } from '../components/product-card';
import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';
import { getCategories, getProducts, getStores, heroImage, stats } from '../lib/catalog-data';

export default async function HomePage() {
  const [categories, products, stores] = await Promise.all([
    getCategories({ rootsOnly: true }),
    getProducts({ limit: 8 }),
    getStores({ limit: 6 }),
  ]);
  const premiumStores = stores.slice(0, 3);
  const featuredProducts = products.slice(0, 4);
  const spotlightCategories = categories.slice(0, 8);

  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="home-hero home-hero-premium">
        <div className="home-hero-aura" aria-hidden="true" />
        <div className="container home-hero-premium-grid">
          <div className="home-hero-copy">
            <p className="eyebrow hero-eyebrow">
              <Sparkles size={15} />
              Azərbaycan üçün B2B topdansatış kataloqu
            </p>
            <h1>Topdansatıcı mağazaları və məhsulları bir yerdə kəşf edin</h1>
            <p className="lead">
              Alıcılar məhsulları araşdırır, mağazaları yoxlayır və satıcı ilə WhatsApp və telefon üzərindən birbaşa
              əlaqə saxlayır. Platforma satış aparmır, etibarlı əlaqəni sürətləndirir.
            </p>

            <form className="search-panel home-search premium-search" action="/products">
              <input name="q" placeholder="Məhsul, mağaza və ya kateqoriya axtarın" />
              <select name="category" aria-label="Kateqoriya">
                <option value="">Bütün kateqoriyalar</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button className="button button-primary" type="submit">
                <Search size={17} />
                Axtar
              </button>
            </form>

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
            {premiumStores.length ? premiumStores.map((store, index) => (
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
            )) : <p className="empty-state">Hazırda göstəriləcək mağaza yoxdur.</p>}
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
          <div className="grid product-grid featured-product-grid">
            {featuredProducts.length ? featuredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            )) : <p className="empty-state">Hazırda göstəriləcək məhsul yoxdur.</p>}
          </div>
        </div>
      </section>

      <section className="section catalog-overview-section">
        <div className="container catalog-overview-grid">
          <div className="catalog-copy">
            <p className="eyebrow">Kataloq naviqasiyası</p>
            <h2>Alıcılar üçün sürətli sektor xəritəsi</h2>
            <p className="lead">
              Əsas kateqoriyalar sadə kart kimi yox, real topdansatış naviqasiyası kimi işləməlidir. Alıcı sektor seçir,
              alt kateqoriyaya keçir və satıcı ilə birbaşa əlaqə saxlayır.
            </p>
            <div className="catalog-proof-list">
              <span>
                <CheckCircle2 size={17} />
                Aktiv mağaza və məhsul qaydası
              </span>
              <span>
                <ShieldCheck size={17} />
                Təsdiqlənmiş satıcı işarələri
              </span>
              <span>
                <Users size={17} />
                Satıcı ilə platformadan kənar əlaqə
              </span>
            </div>
          </div>

          <div className="catalog-feature-grid">
            {categories.slice(0, 6).map((category) => {
              const Icon = category.icon;
              return (
                <Link className="catalog-feature-card" key={category.slug} href={`/categories/${category.slug}`}>
                  <span className="icon-badge">
                    <Icon size={21} />
                  </span>
                  <strong>{category.name}</strong>
                  <small>
                    {category.productCount} məhsul · {category.storeCount} mağaza
                  </small>
                  <em>Kateqoriyaya bax</em>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section fresh-and-popular-section">
        <div className="container fresh-popular-grid">
          <div>
            <div className="section-title-row compact-title-row">
              <div>
                <p className="eyebrow">Son elanlar</p>
                <h2>Yeni əlavə olunanlar</h2>
              </div>
              <Link className="card-link" href="/products">
                Hamısı <ArrowRight size={14} />
              </Link>
            </div>
            <div className="fresh-list">
              {products.slice(0, 3).map((product) => (
                <Link className="fresh-item" href={`/products/${product.slug}`} key={product.slug}>
                  <span className="fresh-thumb" style={{ backgroundImage: `url(${product.imageUrl})` }} />
                  <span>
                    <strong>{product.title}</strong>
                    <small>
                      {product.store} · {product.city}
                    </small>
                  </span>
                  <em>{product.price}</em>
                </Link>
              ))}
            </div>
          </div>

          <aside className="popular-store-panel">
            <div className="section-title-row compact-title-row">
              <div>
                <p className="eyebrow">Organik</p>
                <h2>Populyar mağazalar</h2>
              </div>
            </div>
            {stores.map((store) => (
              <Link className="popular-store-row" href={`/stores/${store.slug}`} key={store.slug}>
                <span className="store-avatar">{store.name.slice(0, 2).toUpperCase()}</span>
                <span>
                  <strong>{store.name}</strong>
                  <small>
                    {store.category} · {store.productCount} məhsul
                  </small>
                </span>
                <ArrowRight size={15} />
              </Link>
            ))}
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container home-flow-grid">
          <div>
            <p className="eyebrow">Necə işləyir</p>
            <h2>Alıcı baxır, satıcı ilə birbaşa əlaqə saxlayır</h2>
            <p className="lead">
              TopdanBazar satış əməliyyatı aparmır. Platforma məhsul və mağaza kəşfini sürətləndirir, əlaqəni isə
              WhatsApp və telefon üzərindən satıcı ilə alıcı arasında saxlayır.
            </p>
          </div>
          <div className="flow-card-list">
            <div className="flow-card">
              <Search size={20} />
              <strong>Məhsulu tapın</strong>
              <span className="card-meta">Kateqoriya, mağaza və məhsul üzrə sürətli axtarış.</span>
            </div>
            <div className="flow-card">
              <ShieldCheck size={20} />
              <strong>Mağazanı yoxlayın</strong>
              <span className="card-meta">Profil, şəhər, məhsul sayı və əlaqə kanalları görünür.</span>
            </div>
            <div className="flow-card">
              <MessageCircle size={20} />
              <strong>Birbaşa yazın</strong>
              <span className="card-meta">Qiymət və sifariş şərtləri satıcı ilə platformadan kənar danışılır.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band home-cta-band premium-cta-band">
            <div>
              <p className="eyebrow">Satıcılar üçün</p>
              <h2>Topdansatış mağazanızı onlayn kataloqa əlavə edin</h2>
              <p className="lead">Məhsullarınızı nümayiş etdirin, müraciətləri izləyin və yeni alıcılarla əlaqə qurun.</p>
            </div>
            <div className="cta-actions">
              <Link className="button" href="/open-store">
                <Building2 size={17} />
                Mağaza aç
              </Link>
              <Link className="button button-ghost-on-dark" href="/login">
                <Store size={17} />
                Daxil ol
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
