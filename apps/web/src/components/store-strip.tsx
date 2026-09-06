import Link from 'next/link';
import { BadgeCheck, MapPin, Megaphone, Package } from 'lucide-react';
import type { StorePreview } from '../lib/catalog-data';

export function StoreStrip({ stores }: { stores: StorePreview[] }) {
  if (!stores.length) return null;

  return (
    <div className="market-store-strip">
      <div className="market-store-strip-track">
        {stores.map((store, index) => (
          <Link className="market-store-card" href={`/stores/${store.slug}`} key={store.slug}>
            {index < 3 ? (
              <span className="market-store-flag">
                <Megaphone size={11} />
                Sponsorlu
              </span>
            ) : null}
            <span aria-hidden="true" className="store-avatar store-avatar-sm">
              {store.name.slice(0, 2).toUpperCase()}
            </span>
            <strong>{store.name}</strong>
            <small>{store.category}</small>
            <span className="market-store-meta">
              <span>
                <Package size={13} />
                {store.productCount} məhsul
              </span>
              <span>
                <MapPin size={13} />
                {store.city}
              </span>
            </span>
            {store.verified ? (
              <span className="market-store-verified">
                <BadgeCheck size={13} />
                Təsdiqlənmiş
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
