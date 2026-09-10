import Link from 'next/link';
import {
  BadgeCheck,
  Building2,
  Clock3,
  MapPin,
  Package,
  PackageCheck,
  Search,
  ShieldCheck,
  Store,
  TrendingUp,
  Truck,
  X,
} from 'lucide-react';
import { CatalogSortSelect } from './catalog-sort-select';
import { CountUp } from './count-up';
import type { CategoryCard, StorePreview, StoreSort } from '../lib/catalog-data';
import { storeAccent } from '../lib/store-accent';
import { STORE_SORT_OPTIONS, storeSortLabel, withoutParam, type StoresSearchQuery } from '../app/stores/stores-filters';

type StoresHeroProps = {
  query: StoresSearchQuery | undefined;
  sort: StoreSort;
  categories: CategoryCard[];
  cities: string[];
  total: number;
  totalProducts: number;
  verifiedStores: number;
  featuredStore?: StorePreview | undefined;
};

/** /stores hero: axtarış, statistika (count-up), trust bar, spotlight mağaza. */
export function StoresHero({
  query,
  sort,
  categories,
  cities,
  total,
  totalProducts,
  verifiedStores,
  featuredStore,
}: StoresHeroProps) {
  const category = categories.find((item) => item.slug === query?.category);

  return (
    <section className="section stores-hero-section">
      <div className="container stores-hero-grid">
        <div className="stores-hero-copy">
          <p className="eyebrow">
            <Building2 size={15} />
            Topdansatış mağazalar
          </p>
          <h1>Etibarlı satıcıları bir yerdə tapın</h1>
          <p className="lead">
            Şəhər, sektor və mağaza adına görə axtarın, məhsul sayına baxın və satıcı ilə birbaşa əlaqəyə keçin.
          </p>

          <div className="stores-hero-stats">
            <span>
              <Store size={16} />
              <strong>
                <CountUp value={total} />
              </strong>
              mağaza
            </span>
            <span>
              <Package size={16} />
              <strong>
                <CountUp value={totalProducts} />
              </strong>
              məhsul
            </span>
            <span>
              <BadgeCheck size={16} />
              <strong>
                <CountUp value={verifiedStores} />
              </strong>
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
              <input name="q" defaultValue={query?.q ?? ''} placeholder="Mağaza və ya məhsul axtar" />
            </label>
            <label className="catalog-search-field stores-city-field">
              <MapPin size={18} />
              <input name="city" defaultValue={query?.city ?? ''} placeholder="Şəhər" />
            </label>
            {query?.category ? <input type="hidden" name="category" value={query.category} /> : null}
            <CatalogSortSelect ariaLabel="Sırala" name="sort" value={sort} options={STORE_SORT_OPTIONS} />
            <button className="button button-primary" type="submit">
              Axtar
            </button>
          </form>

          {query?.q || query?.city || query?.category || sort !== 'newest' ? (
            <div className="stores-active-filters" aria-label="Aktiv filtrlər">
              {query?.q ? (
                <Link className="stores-filter-chip" href={withoutParam(query, 'q')}>
                  “{query.q}” <X size={13} />
                </Link>
              ) : null}
              {query?.city ? (
                <Link className="stores-filter-chip" href={withoutParam(query, 'city')}>
                  <MapPin size={13} />
                  {query.city}
                  <X size={13} />
                </Link>
              ) : null}
              {query?.category ? (
                <Link className="stores-filter-chip" href={withoutParam(query, 'category')}>
                  {category?.name ?? query.category}
                  <X size={13} />
                </Link>
              ) : null}
              {sort !== 'newest' ? (
                <Link className="stores-filter-chip" href={withoutParam(query, 'sort')}>
                  {storeSortLabel(sort)}
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
            <span
              className="stores-spotlight-cover"
              style={{
                backgroundImage: `url(${featuredStore.coverImageUrl})`,
                backgroundColor: storeAccent(featuredStore.slug).bg,
              }}
            >
              <span>
                <TrendingUp size={14} />
                Önə çıxan mağaza
              </span>
            </span>
            <span className="stores-spotlight-body">
              <span
                className="store-avatar"
                style={{
                  backgroundColor: storeAccent(featuredStore.slug).bg,
                  color: storeAccent(featuredStore.slug).fg,
                }}
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
  );
}
