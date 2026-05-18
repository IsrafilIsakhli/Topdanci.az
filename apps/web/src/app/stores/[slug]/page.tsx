import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BadgeCheck,
  BriefcaseBusiness,
  ChevronDown,
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
import { SiteFooter } from '../../../components/site-footer';
import { SiteHeader } from '../../../components/site-header';
import { products, stores } from '../../../lib/catalog-data';

type PageProps = {
  params: Promise<{ slug: string }>;
};

const tabs = ['Məhsullar', 'Mağaza haqqında', 'Əlaqə', 'Statistikalar'];

export default async function StoreDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const store = stores.find((item) => item.slug === slug);

  if (!store) {
    notFound();
  }

  const storeProducts = products.map((product) => ({
    ...product,
    store: store.name,
    city: store.city,
  }));

  return (
    <main className="site-shell store-profile-page">
      <SiteHeader />

      <section className="store-profile-hero">
        <div
          className="store-cover"
          style={{ backgroundImage: `url(${store.coverImageUrl})` }}
          aria-label={`${store.name} mağaza örtük şəkli`}
          role="img"
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
            <Link className="button button-success" href="/contact">
              <MessageSquare size={18} />
              WhatsApp ilə əlaqə
            </Link>
            <button className="button" type="button">
              <Phone size={18} />
              Telefonu göstər
            </button>
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
              <div className="store-filter-row">
                <label className="store-search-field">
                  <Search size={18} />
                  <input placeholder="Bu mağazada məhsul axtar" aria-label="Bu mağazada məhsul axtar" />
                </label>
                <button className="store-sort-button" type="button">
                  Ən yenilər
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>

            <div className="store-product-grid">
              {storeProducts.map((product) => (
                <article className="store-product-card" key={product.slug}>
                  <Link className="store-product-image" href={`/products/${product.slug}`}>
                    <span style={{ backgroundImage: `url(${product.imageUrl})` }} role="img" aria-label={product.imageAlt} />
                    <em>{product.badge}</em>
                  </Link>

                  <div className="store-product-body">
                    <span className="store-product-kicker">{product.category}</span>
                    <Link className="store-product-title" href={`/products/${product.slug}`}>
                      {product.title}
                    </Link>
                    <strong className="store-product-price">{product.price}</strong>
                    <span className="store-product-min">
                      <PackageCheck size={16} />
                      {product.minOrder}
                    </span>
                    <div className="store-product-actions">
                      <Link className="button" href={`/products/${product.slug}`}>
                        Məhsula bax
                      </Link>
                      <Link className="button button-success icon-button" href="/contact" aria-label={`${product.title} üçün WhatsApp`}>
                        <MessageSquare size={18} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="store-load-more">
              <button className="button" type="button">
                Daha çox məhsul yüklə
              </button>
            </div>
          </div>

          <aside className="store-sidebar" id="store-info">
            <section className="store-side-panel contact-panel">
              <h2>Əlaqə saxla</h2>
              <Link className="button button-success button-full" href="/contact">
                <MessageSquare size={18} />
                WhatsApp ilə yaz
              </Link>
              <button className="button button-primary button-full" type="button">
                <Phone size={18} />
                Telefonu göstər
              </button>
              <Link className="button button-full" href="/contact">
                <Mail size={18} />
                E-poçt göndər
              </Link>

              <div className="work-hours">
                <span>İş saatları</span>
                <p>
                  <Clock3 size={17} />
                  <strong>Bazar ertəsi - Cümə:</strong>
                  <br />
                  09:00 - 18:00
                </p>
                <p>
                  <strong>Şənbə:</strong>
                  <br />
                  10:00 - 14:00
                </p>
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
