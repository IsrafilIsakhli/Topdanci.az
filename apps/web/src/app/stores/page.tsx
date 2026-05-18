import Link from 'next/link';
import { MapPin, Store } from 'lucide-react';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { stores } from '../../lib/catalog-data';

export default function StoresPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container">
          <h1>Mağazalar</h1>
          <p className="lead">Yoxlanılmış topdansatıcı mağazalara baxın.</p>
          <div className="grid store-grid" style={{ marginTop: 28 }}>
            {stores.map((store) => (
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
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
