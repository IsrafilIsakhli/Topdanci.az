import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Crown,
  Megaphone,
  PackageCheck,
  Sparkles,
  Store as StoreIcon,
  TrendingUp,
} from 'lucide-react';
import { CategorySearchForm, type CategorySearchItem } from '../components/category-search-form';
import { MarketTicker } from '../components/market-ticker';
import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';
import { StoreStrip } from '../components/store-strip';
import { getCategories, getProducts, getStores, heroImage, stats } from '../lib/catalog-data';
import type { ProductPreview } from '../lib/catalog-data';

export const dynamic = 'force-dynamic';

const paidVitrinCount = 4;

export default async function HomePage() {
  const [allCategories, products, stores] = await Promise.all([
    getCategories(),
    getProducts({ limit: 20 }),
    getStores({ limit: 10 }),
  ]);
  const categorySearchItems: CategorySearchItem[] = allCategories.map(({ id, parentId, slug, name }) => ({
    id,
    parentId,
    slug,
    name,
  }));
  const stripStores = stores.slice(0, 10);
  const premiumStores = stores.slice(0, 6);
  const vitrinProducts = products.slice(0, 12);
  const freshProducts = products.slice(12, 20);
  const marketSections = allCategories.slice(0, 16);

  const productsByStore = new Map<string, ProductPreview[]>();
  for (const product of products) {
    if (!product.storeSlug) continue;
    const mini = productsByStore.get(product.storeSlug) ?? [];
    if (mini.length < 2) {
      mini.push(product);
      productsByStore.set(product.storeSlug, mini);
    }
  }

  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="home-hero home-hero-premium home-hero-compact">
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
          </div>
        </div>
      </section>

      <MarketTicker />

      <section className="section market-strip-section">
        <div className="container">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">
                <Megaphone size={14} />
                Bazar sırası
              </p>
              <h2>Ön cərgə mağazalar</h2>
            </div>
            <Link className="card-link" href="/stores">
              Bütün mağazalara bax <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <StoreStrip stores={stripStores} />
      </section>

      <section className="section section-muted vitrin-section">
        <div className="container">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">
                <Crown size={14} />
                Ödənişli vitrin
              </p>
              <h2>Vitrindəki məhsullar</h2>
            </div>
            <Link className="card-link" href="/products">
              Bütün məhsullar <ArrowRight size={14} />
            </Link>
          </div>

          <div className="vitrin-grid">
            {vitrinProducts.length ? (
              vitrinProducts.map((product, index) => {
                const paid = index < paidVitrinCount;
                return (
                  <Link
                    className={paid ? 'vitrin-card vitrin-card-paid' : 'vitrin-card'}
                    href={`/products/${product.slug}`}
                    key={product.slug}
                  >
                    <span className="vitrin-thumb" style={{ backgroundImage: `url(${product.imageUrl})` }}>
                      <span className={paid ? 'vitrin-flag vitrin-flag-paid' : 'vitrin-flag'}>
                        {paid ? (
                          <>
                            <Crown size={11} />
                            Ödənişli
                          </>
                        ) : (
                          'Vitrin'
                        )}
                      </span>
                      {product.badge ? <span className="vitrin-stock">{product.badge}</span> : null}
                    </span>
                    <span className="vitrin-body">
                      <small>{product.category}</small>
                      <strong>{product.title}</strong>
                      <em>{product.price}</em>
                      <span className="vitrin-meta">
                        <PackageCheck size={13} />
                        {product.minOrder}
                      </span>
                      <span className="vitrin-store">
                        <StoreIcon size={13} />
                        {product.store} · {product.city}
                      </span>
                    </span>
                  </Link>
                );
              })
            ) : (
              <p className="empty-state">Hazırda göstəriləcək məhsul yoxdur.</p>
            )}
          </div>
        </div>
      </section>

      <section className="section sponsored-section">
        <div className="container">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Premium tərəfdaşlar</p>
              <h2>Sponsorlu mağazalar</h2>
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
                    {(productsByStore.get(store.slug) ?? []).length ? (
                      <div className="premium-store-minis">
                        {(productsByStore.get(store.slug) ?? []).map((mini) => (
                          <span className="premium-store-mini" key={mini.slug}>
                            <span aria-hidden="true" style={{ backgroundImage: `url(${mini.imageUrl})` }} />
                            <span>{mini.title}</span>
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Link>
              ))
            ) : (
              <p className="empty-state">Hazırda göstəriləcək mağaza yoxdur.</p>
            )}
          </div>
        </div>
      </section>

      <section className="section market-sections-section">
        <div className="container">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">
                <StoreIcon size={14} />
                Bazar bölmələri
              </p>
              <h2>Kateqoriyalar üzrə gəz</h2>
            </div>
            <Link className="card-link" href="/categories">
              Bütün kateqoriyalar <ArrowRight size={14} />
            </Link>
          </div>

          <div className="market-sections-grid">
            {marketSections.map((category) => {
              const Icon = category.icon;
              return (
                <Link className="market-section-card" key={category.slug} href={`/categories/${category.slug}`}>
                  <span className="market-section-icon">
                    <Icon size={19} />
                  </span>
                  <strong>{category.name}</strong>
                  <small>{category.productCount} məhsul</small>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section fresh-arrivals-section">
        <div className="container">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">
                <TrendingUp size={14} />
                Təzə gələnlər
              </p>
              <h2>Bazara yeni düşənlər</h2>
            </div>
            <Link className="card-link" href="/products?sort=newest">
              Hamısına bax <ArrowRight size={14} />
            </Link>
          </div>

          <div className="fresh-arrivals-grid">
            {freshProducts.length ? (
              freshProducts.map((product) => (
                <Link className="fresh-card" href={`/products/${product.slug}`} key={product.slug}>
                  <span className="fresh-thumb" style={{ backgroundImage: `url(${product.imageUrl})` }} />
                  <span className="fresh-info">
                    <strong>{product.title}</strong>
                    <em>{product.price}</em>
                    <small>{product.store} · {product.city}</small>
                  </span>
                </Link>
              ))
            ) : (
              <p className="empty-state">Hazırda yeni məhsul yoxdur.</p>
            )}
          </div>
        </div>
      </section>

      <section className="section seller-cta-section">
        <div className="container">
          <div className="seller-cta-banner">
            <div className="seller-cta-copy">
              <p className="eyebrow">
                <Sparkles size={14} />
                Satıcılar üçün
              </p>
              <h2>Mağazanı bazarın ön cərgəsinə qoy</h2>
              <p>
                Məhsullarınızı minlərlə alıcıya çatdırın, WhatsApp sorğularını birbaşa qəbul edin və vitrində önə çıxın.
              </p>
            </div>
            <div className="seller-cta-actions">
              <Link className="button button-primary" href="/open-store">
                <StoreIcon size={16} />
                Mağaza aç
              </Link>
              <Link className="button" href="/contact">
                Əlaqə saxla
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
