import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import type { StorePreview } from '../lib/catalog-data';
import { storeAccent } from '../lib/store-accent';

export type StoresCityGroup = {
  city: string;
  total: number;
  stores: StorePreview[];
};

/** "Şəhər mağazaları" bölməsi — ən çox mağazası olan şəhərlər üzrə qruplar. */
export function StoresCitySection({ groups }: { groups: StoresCityGroup[] }) {
  return (
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
          {groups.map(({ city, stores: cityStores, total }) => (
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
                        <small>
                          {store.category} · {store.productCount} məhsul
                        </small>
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
  );
}
