import type { Metadata } from 'next';
import { JsonLd } from '../../components/json-ld';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { StoresCitySection } from '../../components/stores-city-section';
import { StoresHero } from '../../components/stores-hero';
import { StoresMarketList } from '../../components/stores-market-list';
import { StoresShowcase } from '../../components/stores-showcase';
import {
  getCategories,
  getProducts,
  getStoresPage,
  type ProductPreview,
  type StorePreview,
} from '../../lib/catalog-data';
import { absoluteUrl } from '../../lib/site-url';
import {
  buildStoresHref,
  normalizeStoreSort,
  toNumber,
  type StoresSearchQuery,
} from './stores-filters';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Topdansatış mağazaları',
  description:
    'Təsdiqlənmiş topdansatış mağazalarını şəhər, sektor və məhsul sayına görə müqayisə edin. Həftənin vitrini, şəhər mağazaları və topdan qiymət kataloqu bir yerdə.',
  alternates: { canonical: '/stores' },
};

export default async function StoresPage({ searchParams }: { searchParams?: Promise<StoresSearchQuery> }) {
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
    .sort((left, right) => right[1].length - left[1].length)
    .slice(0, 3)
    .map(([city, cityStores]) => ({ city, total: cityStores.length, stores: cityStores.slice(0, 4) }));

  const storesJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Topdansatış mağazaları',
    numberOfItems: page.meta.total,
    itemListElement: stores.slice(0, 20).map((store, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: store.name,
      url: absoluteUrl(`/stores/${store.slug}`),
    })),
  };


  return (
    <main className="site-shell">
      <SiteHeader />
      <JsonLd data={storesJsonLd} />
      <StoresHero
        categories={categories}
        cities={cities}
        featuredStore={featuredStore}
        query={query}
        sort={sort}
        total={page.meta.total}
        totalProducts={totalProducts}
        verifiedStores={verifiedStores}
      />
      {showcaseStores.length ? <StoresShowcase productsByStore={productsByStore} stores={showcaseStores} /> : null}
      <StoresMarketList
        categories={categories}
        moreHref={page.meta.nextCursor ? buildStoresHref(query, page.meta.nextCursor, sort) : '/stores'}
        nextCursor={page.meta.nextCursor}
        rows={listRows}
        sponsored={sponsored}
        total={page.meta.total}
      />
      {cityGroups.length ? <StoresCitySection groups={cityGroups} /> : null}
      <SiteFooter />
    </main>
  );
}
