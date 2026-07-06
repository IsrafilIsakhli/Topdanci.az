import Link from 'next/link';
import { ArrowRight, BadgeCheck, Building2, MapPin, Package, Search, Store, TrendingUp } from 'lucide-react';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { getStores } from '../../lib/catalog-data';

export default async function StoresPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; city?: string }>;
}) {
  const query = await searchParams;
  const stores = await getStores({
    q: query?.q,
    category: query?.category,
    city: query?.city,
    limit: 48,
  });
  const featuredStore = stores[0];
  const totalProducts = stores.reduce((sum, store) => sum + toNumber(store.productCount), 0);
  const cities = Array.from(new Set(stores.map((store) => store.city).filter(Boolean))).slice(0, 5);

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
                <strong>{stores.length}</strong>
                mağaza
              </span>
              <span>
                <Package size={16} />
                <strong>{totalProducts}</strong>
                məhsul
              </span>
              <span>
                <BadgeCheck size={16} />
                <strong>{stores.filter((store) => store.verified).length}</strong>
                təsdiqli
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
              <button className="button button-primary" type="submit">
                Axtar
              </button>
            </form>

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
              <span className="stores-spotlight-cover" style={{ backgroundImage: `url(${featuredStore.coverImageUrl})` }}>
                <span>
                  <TrendingUp size={14} />
                  Önə çıxan mağaza
                </span>
              </span>
              <span className="stores-spotlight-body">
                <span className="store-avatar">{featuredStore.name.slice(0, 2).toUpperCase()}</span>
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

      <section className="section section-muted stores-list-section">
        <div className="container">
          <div className="section-title-row stores-list-title">
            <div>
              <p className="eyebrow">Mağaza kataloqu</p>
              <h2>Aktiv satıcılar</h2>
            </div>
            <span>{stores.length} mağaza tapıldı</span>
          </div>

          <div className="grid store-grid store-market-grid">
            {stores.length ? (
              stores.map((store) => (
                <Link className="card store-market-card" href={`/stores/${store.slug}`} key={store.slug}>
                  <span className="store-market-cover" style={{ backgroundImage: `url(${store.coverImageUrl})` }}>
                    {store.verified ? (
                      <span>
                        <BadgeCheck size={13} />
                        Təsdiqli
                      </span>
                    ) : null}
                  </span>
                  <span className="store-market-body">
                    <span className="store-market-head">
                      <span className="store-avatar">{store.name.slice(0, 2).toUpperCase()}</span>
                      <span>
                        <strong>{store.name}</strong>
                        <small>{store.category}</small>
                      </span>
                    </span>
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
                    <span className="card-link store-market-action">
                      Mağazaya bax <ArrowRight size={14} />
                    </span>
                  </span>
                </Link>
              ))
            ) : (
              <p className="empty-state">Axtarışa uyğun aktiv mağaza tapılmadı.</p>
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
