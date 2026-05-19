import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  FileText,
  MapPin,
  MessageSquare,
  PackageCheck,
  Phone,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { ProductCard } from '../../../components/product-card';
import { SiteFooter } from '../../../components/site-footer';
import { SiteHeader } from '../../../components/site-header';
import { getProduct, getProducts } from '../../../lib/catalog-data';

type PageProps = {
  params: Promise<{ slug: string }>;
};

const defaultDescription =
  'Bu məhsul topdansatış sifarişləri üçün nəzərdə tutulub. Qiymət, çatdırılma və minimum sifariş şərtləri satıcı ilə birbaşa razılaşdırılır. Platforma yalnız mağaza və alıcı arasında əlaqəni asanlaşdırır.';

const benefitCards = [
  {
    icon: Truck,
    title: 'Topdan çatdırılma',
    text: 'Böyük həcmli sifarişlər üçün satıcı ilə logistika şərtlərini razılaşdırın.',
  },
  {
    icon: FileText,
    title: 'Rəsmi müqavilə',
    text: 'B2B əməkdaşlıq və sənədləşmə satıcı ilə platformadan kənar aparılır.',
  },
];

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const [categoryProducts, storeProductsFromApi] = await Promise.all([
    getProducts({ category: product.categorySlug, limit: 8 }),
    product.storeSlug ? getProducts({ store: product.storeSlug, limit: 8 }) : Promise.resolve([]),
  ]);
  const galleryImages = [product.imageUrl, ...categoryProducts.filter((item) => item.slug !== product.slug).map((item) => item.imageUrl)].slice(0, 4);
  const relatedProducts = categoryProducts.filter((item) => item.slug !== product.slug);
  const sameStoreProducts = storeProductsFromApi.filter((item) => item.slug !== product.slug);
  const storeProducts = sameStoreProducts.length ? sameStoreProducts : relatedProducts;
  const storeSlug = product.storeSlug ?? product.store.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const technicalRows = [
    ['Kateqoriya', product.category],
    ['Ölçü vahidi', product.minOrder.includes('ton') ? 'ton' : 'ədəd'],
    ['Minimum sifariş', product.minOrder.replace('Min: ', '')],
    ['Şəhər', product.city],
    ['Qiymət tipi', product.price],
    ['Stok vəziyyəti', product.badge],
  ];

  return (
    <main className="site-shell product-detail-page">
      <SiteHeader />

      <section className="product-detail-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Ana səhifə</Link>
            <ChevronRight size={14} />
            <Link href="/products">Məhsullar</Link>
            <ChevronRight size={14} />
            <Link href={`/categories/${product.categorySlug}`}>{product.category}</Link>
            <ChevronRight size={14} />
            <span>{product.title}</span>
          </nav>

          <div className="product-detail-grid">
            <div className="product-gallery">
              <div
                className="product-gallery-main"
                style={{ backgroundImage: `url(${product.imageUrl})` }}
                aria-label={product.imageAlt}
              />
              <div className="product-thumbs" aria-label="Məhsul şəkilləri">
                {galleryImages.map((imageUrl, index) => (
                  <span
                    className={index === 0 ? 'product-thumb is-active' : 'product-thumb'}
                    key={imageUrl}
                    style={{ backgroundImage: `url(${imageUrl})` }}
                    aria-label={`Məhsul şəkli ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <aside className="product-summary-panel">
              <div className="detail-badges">
                <span>
                  <BadgeCheck size={14} />
                  Təsdiqlənmiş mağaza
                </span>
                <span>{product.badge}</span>
              </div>
              <h1>{product.title}</h1>
              <p className="detail-price">{product.price}</p>

              <dl className="product-facts">
                <div>
                  <dt>Məhsul kodu</dt>
                  <dd>TB-{product.slug.slice(0, 6).toUpperCase()}</dd>
                </div>
                <div>
                  <dt>Kateqoriya</dt>
                  <dd>{product.category}</dd>
                </div>
                <div>
                  <dt>Minimum sifariş</dt>
                  <dd>{product.minOrder.replace('Min: ', '')}</dd>
                </div>
                <div>
                  <dt>Şəhər</dt>
                  <dd>{product.city}</dd>
                </div>
              </dl>

              <Link className="detail-store-card" href={`/stores/${storeSlug}`}>
                <span className="icon-badge">{product.store.slice(0, 1)}</span>
                <span>
                  <strong>{product.store}</strong>
                  <small>
                    <MapPin size={13} />
                    {product.city} · 1,245 məhsul
                  </small>
                </span>
                <span className="store-card-link">Mağazaya bax</span>
              </Link>

              <div className="detail-actions">
                <Link className="button button-success button-full" href="/contact">
                  <MessageSquare size={17} />
                  WhatsApp ilə yaz
                </Link>
                <button className="button button-full" type="button">
                  <Phone size={17} />
                  Telefonu göstər
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section product-detail-content">
        <div className="container product-info-grid">
          <article className="panel product-info-card">
            <h2>
              <PackageCheck size={20} />
              Məhsul haqqında
            </h2>
            <p>{defaultDescription}</p>
            <ul>
              <li>Topdan sifariş üçün uyğundur.</li>
              <li>Qiymət və çatdırılma şərtləri satıcı ilə razılaşdırılır.</li>
              <li>Alıcı satıcı ilə WhatsApp və ya telefon vasitəsilə əlaqə saxlayır.</li>
            </ul>
          </article>

          <div className="detail-benefit-list">
            {benefitCards.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article className="detail-benefit-card" key={benefit.title}>
                  <Icon size={30} />
                  <strong>{benefit.title}</strong>
                  <span>{benefit.text}</span>
                </article>
              );
            })}
          </div>

          <article className="panel technical-panel">
            <h2>
              <ShieldCheck size={20} />
              Texniki məlumatlar
            </h2>
            <div className="technical-table">
              {technicalRows.map(([label, value]) => (
                <div className="technical-row" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="section related-section">
        <div className="container">
          <div className="section-title-row">
            <h2>Eyni mağazadan digər məhsullar</h2>
            <Link className="card-link" href={`/stores/${storeSlug}`}>
              Hamısına bax <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid product-grid">
            {storeProducts.length ? storeProducts.map((item) => (
              <ProductCard key={item.slug} product={item} />
            )) : <p className="empty-state">Bu mağazadan əlavə aktiv məhsul tapılmadı.</p>}
          </div>
        </div>
      </section>

      <section className="section related-section compact-related-section">
        <div className="container">
          <div className="section-title-row">
            <h2>Oxşar məhsullar</h2>
          </div>
          <div className="grid product-grid">
            {relatedProducts.length ? relatedProducts.map((item) => (
              <ProductCard key={item.slug} product={item} />
            )) : <p className="empty-state">Oxşar aktiv məhsul tapılmadı.</p>}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
