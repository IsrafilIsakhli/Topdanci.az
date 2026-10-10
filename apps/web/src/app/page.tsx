import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Coffee,
  Crown,
  Hammer,
  MapPin,
  Megaphone,
  MessageCircle,
  PackageCheck,
  Shirt,
  Smartphone,
  Store as StoreIcon,
  TrendingUp,
} from 'lucide-react';
import { CategorySearchForm, type CategorySearchItem } from '../components/category-search-form';
import { CategoryStrip } from '../components/category-strip';
import { MarketTicker } from '../components/market-ticker';
import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';
import { StoreStrip } from '../components/store-strip';
import { cityStrip, demandRequests, homeStats } from '../features/home/data';
import { getCategories, getProductsPage, getStoresPage, heroImage } from '../lib/catalog-data';
import type { ProductPreview } from '../lib/catalog-data';

export const dynamic = 'force-dynamic';

const categoryStrips = [
  { eyebrow: 'Geyim və Ayaqqabı', title: 'Topdan geyim partiyaları', categorySlug: 'geyim-ayaqqabi-ve-tekstil', icon: Shirt },
  { eyebrow: 'Elektronika', title: 'Topdan elektronika aksesuarları', categorySlug: 'elektronika-ve-aksesuarlar', icon: Smartphone },
  { eyebrow: 'Qida və İçki', title: 'Topdan qida partiyaları', categorySlug: 'qida-ve-icki', icon: Coffee },
  { eyebrow: 'Tikinti və Təmir', title: 'Topdan tikinti materialları', categorySlug: 'tikinti-ve-temir', icon: Hammer },
];

export default async function HomePage() {
  const [allCategories, productPage, storePage] = await Promise.all([
    getCategories(),
    getProductsPage({ limit: 40, sort: 'newest' }),
    getStoresPage({ limit: 14 }),
  ]);
  const products = productPage.items;
  const stores = storePage.items;
  const stats = homeStats(storePage.meta.total, productPage.meta.total);
  const categorySearchItems: CategorySearchItem[] = allCategories.map(({ id, parentId, slug, name }) => ({
    id,
    parentId,
    slug,
    name,
  }));
  const stripStores = stores.slice(0, 8);
  const premiumStores = stores.slice(0, 6);
  const vitrinProducts = products.slice(6, 14).length ? products.slice(6, 14) : products.slice(0, 8);
  const freshProducts = products.slice(0, 6);

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

      <section className="home-hero home-hero-premium home-hero-compact" style={{ '--home-hero-image': `url(${heroImage})` } as CSSProperties}>
        <div className="container home-hero-premium-grid">
          <div className="home-hero-copy">
            <h1>TopdanBazar</h1>
            <p className="lead">
              Topdansatış məhsullarını və mağazaları tapın. Qiyməti satıcı ilə danışın, WhatsApp və telefonla birbaşa əlaqə saxlayın.
            </p>
            {productPage.meta.isDemo || storePage.meta.isDemo ? <p className="catalog-demo-note">Nümunə kataloq</p> : null}

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

        </div>
      </section>

      <MarketTicker />

      <section aria-label="Şəhərlər üzrə topdan bazar" className="city-strip-section">
        <div className="container">
          <div className="city-strip">
            <span className="city-strip-label">
              <MapPin size={15} />
              Şəhər üzrə bazar
            </span>
            <div className="city-strip-chips">
              {cityStrip.map((city) => (
                <Link className="city-chip" href={`/stores?city=${encodeURIComponent(city.name)}`} key={city.name}>
                  <strong>{city.name}</strong>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

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
                Məhsul seçimi
              </p>
              <h2>Vitrindəki məhsullar</h2>
            </div>
            <Link className="card-link" href="/products">
              Bütün məhsullar <ArrowRight size={14} />
            </Link>
          </div>

          <div className="vitrin-grid">
            {vitrinProducts.length ? (
              vitrinProducts.map((product) => {
                return (
                  <Link
                    className="vitrin-card"
                    href={`/products/${product.slug}`}
                    key={product.slug}
                  >
                    <span className="vitrin-thumb" style={{ backgroundImage: `url(${product.imageUrl})` }}>
                      {product.badge ? <span className="vitrin-stock">{product.badge}</span> : null}
                    </span>
                    <span className="vitrin-body">
                      <small>{product.category}</small>
                      <strong>{product.title}</strong>
                      {product.priceTiers?.length ? (
                        <span className="tier-ladder">
                          {product.priceTiers.map((tier, tierIndex) => (
                            <span
                              className={tierIndex === product.priceTiers!.length - 1 ? 'tier-row tier-best' : 'tier-row'}
                              key={tier.qty}
                            >
                              <small>{tier.qty}</small>
                              <em>{tier.price}</em>
                            </span>
                          ))}
                        </span>
                      ) : (
                        <em>{product.price}</em>
                      )}
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

      {categoryStrips.slice(0, 2).map((strip) => (
        <CategoryStrip
          categorySlug={strip.categorySlug}
          eyebrow={strip.eyebrow}
          icon={strip.icon}
          key={strip.categorySlug}
          products={products.filter((product) => product.categorySlug === strip.categorySlug).slice(0, 4)}
          title={strip.title}
        />
      ))}

      <section className="section sponsored-section">
        <div className="container">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Mağaza seçimi</p>
              <h2>Kataloqdakı mağazalar</h2>
            </div>
            <Link className="card-link" href="/stores">
              Bütün mağazalara bax <ArrowRight size={14} />
            </Link>
          </div>

          <div className="premium-store-grid">
            {premiumStores.length ? (
              premiumStores.map((store) => (
                <Link className="premium-store-card" href={`/stores/${store.slug}`} key={store.slug}>
                  <div className="premium-store-cover" style={{ backgroundImage: `url(${store.coverImageUrl})` }}>
                    <span className="sponsored-pill">
                      <Megaphone size={13} />
                      Mağaza
                    </span>
                  </div>
                  <div className="premium-store-body">
                    <div className="premium-store-head">
                      <span className="store-avatar">{store.name.slice(0, 2).toUpperCase()}</span>
                      {store.verified ? <span className="verified-pill">
                        <BadgeCheck size={14} />
                        Təsdiqlənmiş
                      </span> : null}
                    </div>
                    <strong>{store.name}</strong>
                    <span className="card-meta">{store.category}</span>
                    <div className="store-metric-row">
                      <span>{store.productCount} məhsul</span>
                      <span>{store.city}</span>
                      <span>{store.views} baxış</span>
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

      <section className="section section-muted demand-board-section">
        <div className="container">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">
                <ClipboardList size={14} />
                Tələb taxtası
              </p>
              <h2>Alış sorğusu nümunələri</h2>
            </div>
            <Link className="card-link" href="/contact">
              Tələbini yerləşdir <ArrowRight size={14} />
            </Link>
          </div>

          <div className="demand-board-grid">
            {demandRequests.map((request) => (
              <div className="demand-card" key={request.title}>
                <div className="demand-head">
                  <span className="demand-qty">{request.quantity}</span>
                </div>
                <strong>{request.title}</strong>
                <div className="demand-foot">
                  <span className="demand-city">
                    <MapPin size={13} />
                    {request.city}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="demand-cta">
            <p>
              Axtardığınız məhsulla bağlı dəstək komandasına müraciət edin.
            </p>
            <Link className="button button-primary" href="/contact">
              <MessageCircle size={16} />
              Öz tələbimi yerləşdir
            </Link>
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

      <SiteFooter />
    </main>
  );
}
