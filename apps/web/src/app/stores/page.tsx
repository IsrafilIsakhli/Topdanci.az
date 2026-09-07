import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Clock3,
  MapPin,
  MessageCircle,
  Package,
  PackageCheck,
  Search,
  ShieldCheck,
  Store,
  TrendingUp,
  Truck,
  X,
} from 'lucide-react';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { LeadWhatsAppLink } from '../../components/lead-actions';
import { StoresSortSelect } from '../../components/stores-sort-select';
import { categoryRoute } from '../../lib/routes';
import {
  getCategories,
  getProducts,
  getStoresPage,
  type ProductPreview,
  type StorePreview,
  type StoreSort,
} from '../../lib/catalog-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Topdansatış mağazaları',
  description:
    'Təsdiqlənmiş topdansatış mağazalarını şəhər, sektor və məhsul sayına görə müqayisə edin. Həftənin vitrini, şəhər mağazaları və topdan qiymət kataloqu bir yerdə.',
  alternates: { canonical: '/stores' },
};

export default async function StoresPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; city?: string; cursor?: string; sort?: string }>;
}) {
  const query = await searchParams;
  const sort = normalizeStoreSort(query?.sort);
  const [page, categories, products] = await Promise.all([
    getStoresPage({
      q: query?.q,
      category: query?.category,
      city: query?.city,
      cursor: query?.cursor,
      sort,
      limit: 18,
    }),
    getCategories({ rootsOnly: true }),
    getProducts({ limit: 60 }),
  ]);
  const stores = page.items;
  const featuredStore = stores[0];
  const showcaseStores = stores.slice(1, 3);
  const sponsored = new Set(stores.slice(0, 4).map((store) => store.slug));
  const totalProducts = page.meta.totalProducts ?? stores.reduce((sum, store) => sum + toNumber(store.productCount), 0);
  const verifiedStores = page.meta.verifiedStores ?? stores.filter((store) => store.verified).length;
  const cities = Array.from(new Set(stores.map((store) => store.city).filter(Boolean))).slice(0, 5);

  // Hər mağaza üçün 3 məhsulluq vitrin zolağı.
  const productsByStore = new Map<string, ProductPreview[]>();
  for (const product of products) {
    if (!product.storeSlug) continue;
    const rail = productsByStore.get(product.storeSlug) ?? [];
    if (rail.length < 3) {
      rail.push(product);
      productsByStore.set(product.storeSlug, rail);
    }
  }
  const listRows = stores.map((store) => ({ store, strip: productsByStore.get(store.slug) ?? [] }));

  // Şəhər üzrə kataloq — ən çox mağazası olan 3 şəhər.
  const cityGroups = Object.entries(
    stores.reduce<Record<string, StorePreview[]>>((groups, store) => {
      if (!store.city) return groups;
      (groups[store.city] ??= []).push(store);
      return groups;
    }, {}),
  )
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
    .map(([city, cityStores]) => ({ city, total: cityStores.length, stores: cityStores.slice(0, 4) }));

  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="section stores-hero-section">
        <div className="container stores-hero-grid">
          <div className="stores-hero-copy">
            <p className="eyebrow">
              <Building2 size={15} />
              Topdansatıcı mağazalar
            </p>
            <h1>Etibarlı satıcıları bir yerdə tapın</h1>
            <p className="lead">
              Şəhər, sektor və mağaza adına görə axtarın, məhsul sayına baxın və satıcı ilə birbaşa əlaqəyə keçin.
            </p>

            <div className="stores-hero-stats">
              <span>
                <Store size={16} />
                <strong>{page.meta.total}</strong>
                mağaza
              </span>
              <span>
                <Package size={16} />
                <strong>{totalProducts}</strong>
                məhsul
              </span>
              <span>
                <BadgeCheck size={16} />
                <strong>{verifiedStores}</strong>
                təsdiqli
              </span>
            </div>

            <div className="stores-trust-bar" aria-label="Mağaza zəmanətləri">
              <span>
                <ShieldCheck size={16} />
                <strong>{verifiedStores}</strong> təsdiqli satıcı
              </span>
              <span>
                <Truck size={16} />
                Ölkə üzrə topdan çatdırılma
              </span>
              <span>
                <PackageCheck size={16} />
                Sifariş və qiymət zəmanəti
              </span>
              <span>
                <Clock3 size={16} />
                7/24 satıcı dəstəyi
              </span>
            </div>
            <form className="catalog-search-panel stores-search-panel" action="/stores">
              <label className="catalog-search-field">
                <Search size={18} />
                <input
                  name="q"
                  defaultValue={query?.q ?? ''}
                  placeholder="Mağaza, məhsul və ya kateqoriya axtarın"
                />
              </label>
              <label className="catalog-search-field stores-city-field">
                <MapPin size={18} />
                <input name="city" defaultValue={query?.city ?? ''} placeholder="Şəhər" />
              </label>
              {query?.category ? <input type="hidden" name="category" value={query.category} /> : null}
              <StoresSortSelect value={sort} />
              <button className="button button-primary" type="submit">
                Axtar
              </button>
            </form>

            {(query?.q || query?.city || query?.category) ? (
              <div className="stores-active-filters" aria-label="Aktiv filtrlər">
                {query.q ? (
                  <Link className="stores-filter-chip" href={withoutParam(query, 'q')}>
                    “{query.q}” <X size={13} />
                  </Link>
                ) : null}
                {query.city ? (
                  <Link className="stores-filter-chip" href={withoutParam(query, 'city')}>
                    <MapPin size={13} />
                    {query.city}
                    <X size={13} />
                  </Link>
                ) : null}
                {query.category ? (
                  <Link className="stores-filter-chip" href={withoutParam(query, 'category')}>
                    {categories.find((category) => category.slug === query.category)?.name ?? query.category}
                    <X size={13} />
                  </Link>
                ) : null}
                {query.sort && sort !== 'newest' ? (
                  <Link className="stores-filter-chip" href={withoutParam(query, 'sort')}>
                    {sort === 'popular' ? 'Ən çox baxılan' : 'Ən çox məhsul'}
                    <X size={13} />
                  </Link>
                ) : null}
                <Link className="stores-filter-clear" href="/stores">
                  Hamısını təmizlə
                </Link>
              </div>
            ) : null}

            {cities.length ? (
              <div className="store-city-row" aria-label="Populyar şəhərlər">
                {cities.map((city) => (
                  <Link href={`/stores?city=${encodeURIComponent(city)}`} key={city}>
                    {city}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {featuredStore ? (
            <Link className="stores-spotlight-card" href={`/stores/${featuredStore.slug}`}>
              <span className="stores-spotlight-cover" style={{ backgroundImage: `url(${featuredStore.coverImageUrl})`, backgroundColor: storeAccent(featuredStore.slug).bg }}>
                <span>
                  <TrendingUp size={14} />
                  Önə çıxan mağaza
                </span>
              </span>
              <span className="stores-spotlight-body">
                <span
                  className="store-avatar"
                  style={{ backgroundColor: storeAccent(featuredStore.slug).bg, color: storeAccent(featuredStore.slug).fg }}
                >
                  {featuredStore.name.slice(0, 2).toUpperCase()}
                </span>
                <span>
                  <strong>{featuredStore.name}</strong>
                  <small>{featuredStore.category}</small>
                </span>
                {featuredStore.verified ? (
                  <em>
                    <BadgeCheck size={13} />
                    Təsdiqlənmiş
                  </em>
                ) : null}
              </span>
            </Link>
          ) : null}
        </div>
      </section>

      {showcaseStores.length ? (
        <section className="section stores-showcase-section">
          <div className="container">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">Vitrin</p>
                <h2>Həftənin mağazaları</h2>
              </div>
              <Link className="card-link" href="/stores">
                Bütün mağazalar <ArrowRight size={15} />
              </Link>
            </div>

            <div className="stores-showcase-grid">
              {showcaseStores.map((store) => {
                const strip = productsByStore.get(store.slug) ?? [];
                return (
                  <Link className="stores-showcase-card" href={`/stores/${store.slug}`} key={store.slug}>
                    <span
                      className="stores-showcase-cover"
                      style={{ backgroundImage: `url(${store.coverImageUrl})`, backgroundColor: storeAccent(store.slug).bg }}
                    >
                      <span className="stores-showcase-tag">
                        <TrendingUp size={13} />
                        Vitrin mağazası
                      </span>
                    </span>
                    <span className="stores-showcase-body">
                      <span className="stores-showcase-head">
                        <span
                          className="store-avatar"
                          style={{ backgroundColor: storeAccent(store.slug).bg, color: storeAccent(store.slug).fg }}
                        >
                          {store.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span>
                          <strong>{store.name}</strong>
                          <small>{store.category} · {store.city}</small>
                        </span>
                        {store.verified ? (
                          <em>
                            <BadgeCheck size={13} />
                            Təsdiqli
                          </em>
                        ) : null}
                      </span>
                      {strip.length ? (
                        <span className="stores-showcase-strip">
                          {strip.map((product) => (
                            <span
                              aria-hidden="true"
                              className="stores-showcase-thumb"
                              key={product.slug}
                              style={{ backgroundImage: `url(${product.imageUrl})` }}
                            />
                          ))}
                          <span className="stores-showcase-more">{store.productCount} məhsul</span>
                        </span>
                      ) : null}
                      <span className="stores-showcase-meta">
                        <span>
                          <Package size={14} />
                          {store.productCount} məhsul
                        </span>
                        <span>
                          <MapPin size={14} />
                          {store.city}
                        </span>
                        <span>
                          <TrendingUp size={14} />
                          {store.views}
                        </span>
                      </span>
                      <span className="card-link stores-showcase-action">
                        Vitrinə bax <ArrowRight size={15} />
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
      <section className="section section-muted stores-list-section">
        <div className="container">
          <div className="section-title-row stores-list-title">
            <div>
              <p className="eyebrow">Mağaza kataloqu</p>
              <h2>Aktiv satıcılar</h2>
            </div>
            <span>{page.meta.total} mağaza tapıldı</span>
          </div>

          {categories.length ? (
            <div className="stores-category-chips" aria-label="Kateqoriya üzrə mağazalar">
              {categories.slice(0, 8).map((category) => {
                const matchedCount = stores.filter((store) => store.categorySlug === category.slug).length;
                const chipCount =
                  category.storeCount && category.storeCount !== '0'
                    ? category.storeCount
                    : matchedCount > 0 ? String(matchedCount) : null;
                return (
                  <Link href={categoryRoute(category.slug)} key={category.slug}>
                    <category.icon size={15} />
                    {category.name}
                    {chipCount ? <small>{chipCount}</small> : null}
                  </Link>
                );
              })}
              <Link href="/products">Bütün kateqoriyalar</Link>
            </div>
          ) : null}

          <div className="grid store-grid store-market-grid">
            {listRows.length ? (
              listRows.map(({ store, strip }) => (
                <div className="card store-market-card" key={store.slug}>
                  <Link className="store-market-link" href={`/stores/${store.slug}`} aria-label={`${store.name} mağazasına bax`}>
                    <span className="store-market-cover" style={{ backgroundImage: `url(${store.coverImageUrl})`, backgroundColor: storeAccent(store.slug).bg }}>
                      {store.verified ? (
                        <span>
                          <BadgeCheck size={13} />
                          Təsdiqli
                        </span>
                      ) : null}
                      {sponsored.has(store.slug) ? <em>Bu həftə</em> : null}
                    </span>
                    <span className="store-market-body">
                      <span className="store-market-head">
                        <span
                          className="store-avatar"
                          style={{ backgroundColor: storeAccent(store.slug).bg, color: storeAccent(store.slug).fg }}
                        >
                          {store.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span>
                          <strong>{store.name}</strong>
                          <small>{store.category}</small>
                        </span>
                      </span>
                      {strip.length ? (
                        <span className="store-market-strip">
                          {strip.map((product) => (
                            <span
                              aria-hidden="true"
                              className="stores-market-thumb"
                              key={product.slug}
                              style={{ backgroundImage: `url(${product.imageUrl})` }}
                            />
                          ))}
                        </span>
                      ) : null}
                      <span className="store-market-meta">
                        <span>
                          <MapPin size={14} />
                          {store.city}
                        </span>
                        <span>
                          <Package size={14} />
                          {store.productCount} məhsul
                        </span>
                        <span>
                          <TrendingUp size={14} />
                          {store.views}
                        </span>
                      </span>
                    </span>
                  </Link>
                  <span className="store-market-actions">
                    <LeadWhatsAppLink
                      className="button button-success store-market-action"
                      phone={store.whatsappNumber}
                      storeId={store.id}
                      storeName={store.name}
                      source="stores-market-card"
                    >
                      <MessageCircle size={16} />
                      WhatsApp
                    </LeadWhatsAppLink>
                    <Link className="button store-market-action" href={`/stores/${store.slug}`}>
                      Mağazaya bax
                      <ArrowRight size={15} />
                    </Link>
                  </span>
                </div>
              ))
            ) : (
              <p className="empty-state">Axtarışa uyğun aktiv mağaza tapılmadı.</p>
            )}
          </div>

          {page.meta.nextCursor ? (
            <div className="catalog-pagination">
              <Link className="button" href={buildStoresHref(query, page.meta.nextCursor, sort)}>
                Daha çox mağaza <ArrowRight size={16} />
              </Link>
            </div>
          ) : null}
        </div>
      </section>
      {cityGroups.length ? (
        <section className="section stores-city-section">
          <div className="container">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">Ölkə üzrə</p>
                <h2>Şəhər mağazaları</h2>
              </div>
              <Link className="card-link" href="/stores">
                Bütün mağazalar <ArrowRight size={15} />
              </Link>
            </div>

            <div className="stores-city-grid">
              {cityGroups.map(({ city, stores: cityStores, total }) => (
                <div className="stores-city-box" key={city}>
                  <div className="stores-city-head">
                    <span>
                      <MapPin size={15} />
                      {city}
                    </span>
                    <small>{total} mağaza</small>
                  </div>
                  <ul className="stores-city-stores">
                    {cityStores.map((store) => (
                      <li key={store.slug}>
                        <Link href={`/stores/${store.slug}`}>
                          <span
                            className="store-avatar"
                            style={{ backgroundColor: storeAccent(store.slug).bg, color: storeAccent(store.slug).fg }}
                          >
                            {store.name.slice(0, 2).toUpperCase()}
                          </span>
                          <span>
                            <strong>{store.name}</strong>
                            <small>{store.category} · {store.productCount} məhsul</small>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link className="card-link stores-city-link" href={`/stores?city=${encodeURIComponent(city)}`}>
                    Bütün {city} mağazaları <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <SiteFooter />
    </main>
  );
}

function toNumber(value: string) {
  const number = parseInt(value.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(number) ? number : 0;
}

const STORE_ACCENTS: Array<{ bg: string; fg: string }> = [
  { bg: '#0f5b3a', fg: '#ffffff' },
  { bg: '#1e3a8a', fg: '#ffffff' },
  { bg: '#7c2d92', fg: '#ffffff' },
  { bg: '#b54708', fg: '#ffffff' },
  { bg: '#0f766e', fg: '#ffffff' },
  { bg: '#be185d', fg: '#ffffff' },
  { bg: '#0369a1', fg: '#ffffff' },
  { bg: '#4d2c3a', fg: '#ffffff' },
];

function storeAccent(slug: string) {
  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash * 31 + slug.charCodeAt(index)) & 0x7fffffff;
  }
  return STORE_ACCENTS[hash % STORE_ACCENTS.length]!;
}

function normalizeStoreSort(value?: string): StoreSort {
  return value === 'popular' || value === 'products' ? value : 'newest';
}

function withoutParam(
  query: { q?: string; category?: string; city?: string; sort?: string } | undefined,
  drop: 'q' | 'category' | 'city' | 'sort',
) {
  if (!query) return '/stores';
  const params = new URLSearchParams();
  if (query.q && drop !== 'q') params.set('q', query.q);
  if (query.category && drop !== 'category') params.set('category', query.category);
  if (query.city && drop !== 'city') params.set('city', query.city);
  if (query.sort && drop !== 'sort') params.set('sort', query.sort);
  const qs = params.toString();
  return qs ? `/stores?${qs}` : '/stores';
}

function buildStoresHref(
  query: { q?: string; category?: string; city?: string } | undefined,
  cursor: string,
  sort: StoreSort,
) {
  const params = new URLSearchParams();
  if (query?.q) params.set('q', query.q);
  if (query?.category) params.set('category', query.category);
  if (query?.city) params.set('city', query.city);
  if (sort !== 'newest') params.set('sort', sort);
  params.set('cursor', cursor);
  return `/stores?${params.toString()}`;
}