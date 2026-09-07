import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  Eye,
  Mail,
  MapPin,
  MessageSquare,
  PackageCheck,
  Phone,
  Search,
  Store,
} from 'lucide-react';
import { LeadViewTracker, LeadWhatsAppLink, PhoneRevealButton } from '../../../components/lead-actions';
import { JsonLd } from '../../../components/json-ld';
import { SiteFooter } from '../../../components/site-footer';
import { SiteHeader } from '../../../components/site-header';
import { ProductCard } from '../../../components/product-card';
import { getProducts, getStore } from '../../../lib/catalog-data';
import { absoluteUrl } from '../../../lib/site-url';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore(slug);
  if (!store) {
    return { title: 'Mağaza tapılmadı', robots: { index: false, follow: false } };
  }

  return {
    title: store.name,
    description: store.description,
    alternates: { canonical: `/stores/${store.slug}` },
    openGraph: {
      type: 'website',
      title: store.name,
      description: store.description,
      url: `/stores/${store.slug}`,
      images: [{ url: absoluteUrl(store.coverImageUrl), alt: store.name }],
    },
  };
}

const tabs = ['Məhsullar', 'Mağaza haqqında', 'Əlaqə', 'Statistikalar'];

export default async function StoreDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const store = await getStore(slug);

  if (!store) {
    notFound();
  }

  const storeProducts = await getProducts({ store: store.slug, q: query?.q, limit: 48 });
  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.name,
    description: store.description,
    image: absoluteUrl(store.coverImageUrl),
    url: absoluteUrl(`/stores/${store.slug}`),
    address: {
      '@type': 'PostalAddress',
      addressLocality: store.city,
      addressCountry: 'AZ',
    },
    ...(store.phone ? { telephone: store.phone } : {}),
    ...(store.email ? { email: store.email } : {}),
  };

  return (
    <main className="site-shell store-profile-page">
      <JsonLd data={storeJsonLd} />
      <LeadViewTracker source="store-detail" storeId={store.id} type="STORE_VIEW" />
      <SiteHeader />

      <section className="store-profile-hero">
        <div
          aria-label={`${store.name} mağaza örtük şəkli`}
          className="store-cover"
          role="img"
          style={{ backgroundImage: `url(${store.coverImageUrl})` }}
        />

        <div className="container store-profile-summary">
          <div className="store-logo-card" aria-hidden="true">
            <Store size={34} />
          </div>

          <div className="store-summary-main">
            <div className="store-title-line">
              <h1>{store.name}</h1>
              {store.verified ? (
                <span className="verified-pill">
                  <BadgeCheck size={15} />
                  Təsdiqlənmiş mağaza
                </span>
              ) : null}
            </div>

            <div className="store-meta-row">
              <span>
                <BriefcaseBusiness size={16} />
                {store.category}
              </span>
              <span>
                <MapPin size={16} />
                {store.city}
              </span>
              <span>
                <PackageCheck size={16} />
                {store.productCount} məhsul
              </span>
              <span>
                <Eye size={16} />
                {store.views} baxış
              </span>
            </div>
          </div>

          <div className="store-summary-actions">
            <LeadWhatsAppLink
              className="button button-success"
              phone={store.whatsappNumber}
              source="store-profile-hero"
              storeId={store.id}
              storeName={store.name}
            >
              <MessageSquare size={18} />
              WhatsApp ilə əlaqə
            </LeadWhatsAppLink>
            <PhoneRevealButton className="button" phone={store.phone} source="store-profile-hero" storeId={store.id}>
              <Phone size={18} />
              Telefonu göstər
            </PhoneRevealButton>
          </div>
        </div>

        <div className="store-tabs-wrap">
          <div className="container store-tabs">
            {tabs.map((tab, index) => (
              <a className={index === 0 ? 'is-active' : undefined} href={`#${index === 0 ? 'products' : 'store-info'}`} key={tab}>
                {tab}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section store-profile-content" id="products">
        <div className="container store-profile-layout">
          <div className="store-products-column">
            <div className="store-products-head">
              <h2>Bütün məhsullar</h2>
              <form action={`/stores/${store.slug}`} className="store-filter-row">
                <label className="store-search-field">
                  <Search size={18} />
                  <input
                    aria-label="Bu mağazada məhsul axtar"
                    defaultValue={query?.q ?? ''}
                    name="q"
                    placeholder="Bu mağazada məhsul axtar"
                  />
                </label>
              <button className="store-sort-button" type="submit">
                Axtar
              </button>
              </form>
            </div>

            <div className="grid product-grid store-product-grid">
              {storeProducts.length ? (
                storeProducts.map((product) => <ProductCard key={product.slug} product={product} />)
              ) : (
                <p className="empty-state">Bu mağazada aktiv məhsul tapılmadı.</p>
              )}
            </div>
          </div>

          <aside className="store-sidebar" id="store-info">
            <section className="store-side-panel contact-panel">
              <h2>Əlaqə saxla</h2>
              <LeadWhatsAppLink
                className="button button-success button-full"
                phone={store.whatsappNumber}
                source="store-profile-sidebar"
                storeId={store.id}
                storeName={store.name}
              >
                <MessageSquare size={18} />
                WhatsApp ilə yaz
              </LeadWhatsAppLink>
              <PhoneRevealButton className="button button-primary button-full" phone={store.phone} source="store-profile-sidebar" storeId={store.id}>
                <Phone size={18} />
                Telefonu göstər
              </PhoneRevealButton>
              <Link className="button button-full" href={`/contact?store=${encodeURIComponent(store.name)}`}>
                <Mail size={18} />
                E-poçt göndər
              </Link>

              <div className="work-hours">
                <span>
                  <Clock3 size={15} />
                  İş saatları
                </span>
                <div className="work-hours-row">
                  <strong>Bazar ertəsi – Cümə</strong>
                  <em>09:00 – 18:00</em>
                </div>
                <div className="work-hours-row">
                  <strong>Şənbə</strong>
                  <em>10:00 – 14:00</em>
                </div>
                <div className="work-hours-row is-closed">
                  <strong>Bazar</strong>
                  <em>Bağlıdır</em>
                </div>
              </div>
            </section>

            <section className="store-side-panel about-panel">
              <span>Mağaza haqqında qısa</span>
              <p>{store.description}</p>
              <a href="#store-info">Daha ətraflı</a>
            </section>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
