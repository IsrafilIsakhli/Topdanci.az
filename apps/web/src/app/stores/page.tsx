import Link from 'next/link';
import { MapPin, Search, Store } from 'lucide-react';
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

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container">
          <div className="section-title-row">
            <div>
              <h1>Mağazalar</h1>
              <p className="lead">Yoxlanılmış topdansatıcı mağazalara baxın.</p>
            </div>
          </div>

          <form className="catalog-search-panel" action="/stores">
            <label className="catalog-search-field">
              <Search size={18} />
              <input
                name="q"
                defaultValue={query?.q ?? ''}
                placeholder="Mağaza, məhsul və ya kateqoriya axtarın"
              />
            </label>
            <input name="city" defaultValue={query?.city ?? ''} placeholder="Şəhər" />
            {query?.category ? <input type="hidden" name="category" value={query.category} /> : null}
            <button className="button button-primary" type="submit">
              Axtar
            </button>
          </form>

          <div className="grid store-grid" style={{ marginTop: 28 }}>
            {stores.length ? (
              stores.map((store) => (
                <Link className="card store-card" href={`/stores/${store.slug}`} key={store.slug}>
                  <div>
                    <span className="icon-badge">
                      <Store size={20} />
                    </span>
                    <strong>{store.name}</strong>
                    <span className="card-meta">{store.category}</span>
                  </div>
                  <span className="card-meta">
                    <MapPin size={14} /> {store.city} · {store.productCount} məhsul
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
