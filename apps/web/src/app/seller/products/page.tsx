'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Edit3, EyeOff, Loader2, PackageSearch, Plus, Search, Send, Trash2 } from 'lucide-react';
import {
  deleteSellerProduct,
  getCategoryOptions,
  getSellerProducts,
  submitSellerProduct,
  type CategoryOption,
  type SellerProduct,
} from '../../../lib/seller-api';
import { PRODUCT_STATUS_LABELS, productStatusLabel, productStatusTone } from '../../../lib/status-labels';

export default function SellerProductsPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState('');
  const [error, setError] = useState('');

  const filters = useMemo(
    () => ({
      q: query.trim() || undefined,
      status: status || undefined,
      categoryId: categoryId || undefined,
    }),
    [categoryId, query, status],
  );

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    Promise.all([getSellerProducts(filters), getCategoryOptions()])
      .then(([productResponse, categoryResponse]) => {
        if (!mounted) return;
        setProducts(productResponse.data);
        setCategories(categoryResponse.data);
        setError('');
      })
      .catch(() => setError('Məhsullar yüklənmədi.'))
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [filters]);

  async function handleSubmit(productId: string) {
    setIsWorking(productId);
    setError('');
    try {
      const response = await submitSellerProduct(productId);
      setProducts((items) => items.map((item) => (item.id === productId ? response.data : item)));
    } catch {
      setError('Məhsul yoxlamaya göndərilmədi.');
    } finally {
      setIsWorking('');
    }
  }

  async function handleDelete(productId: string) {
    if (!window.confirm('Bu məhsul silinsin?')) return;

    setIsWorking(productId);
    setError('');
    try {
      await deleteSellerProduct(productId);
      setProducts((items) => items.filter((item) => item.id !== productId));
    } catch {
      setError('Məhsul silinmədi.');
    } finally {
      setIsWorking('');
    }
  }

  return (
    <div className="seller-page">
      <div className="dash2-page">
        <div className="dash2-page-head">
          <div>
            <h2>Məhsullar</h2>
            <p>Mağazanızın bütün məhsullarını buradan yaradın, redaktə edin və yoxlamaya göndərin.</p>
          </div>
          <Link className="dash2-cta" href="/seller/products/new">
            <Plus size={16} />
            Məhsul əlavə et
          </Link>
        </div>

        <section aria-label="Filtrlər" className="dash2-toolbar">
          <label className="dash2-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Məhsul adı və ya açıqlama üzrə axtar..."
            />
          </label>
          <select className="dash2-select" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="">Bütün kateqoriyalar</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select className="dash2-select" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Bütün statuslar</option>
            {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </section>

        {error ? <div className="form-alert form-alert-error">{error}</div> : null}

        {isLoading ? (
          <div className="dash2-list-card">
            <div className="seller-table-loading">
              <Loader2 className="spin-icon" size={20} />
              Məhsullar yüklənir
            </div>
          </div>
        ) : products.length ? (
          <section className="dash2-list-card">
            {products.map((product, index) => (
              <article className="dash2-row" key={product.id} style={{ animationDelay: `${index * 45}ms` }}>
                <span
                  className="dash2-row-thumb"
                  style={
                    product.images[0]?.cdnUrl ? { backgroundImage: `url(${product.images[0].cdnUrl})` } : undefined
                  }
                >
                  {product.images[0]?.cdnUrl ? null : 'TB'}
                </span>
                <span className="dash2-row-main">
                  <strong>{product.title}</strong>
                  <small>
                    {product.category?.name ?? 'Kateqoriyasız'} · {product.store.name}
                  </small>
                  {product.reviewNote ? <em>{product.reviewNote}</em> : null}
                </span>
                <span className={`dash2-status ${productStatusTone(product.status)}`}>{productStatusLabel(product.status)}</span>
                <span className="dash2-price">{product.priceLabel}</span>
                <span className="dash2-row-actions">
                  <Link className="dash2-icon-action" href={`/seller/products/${product.id}/edit`} aria-label="Redaktə et" title="Redaktə et">
                    <Edit3 size={15} />
                  </Link>
                  {['DRAFT', 'REJECTED', 'PASSIVE'].includes(product.status) ? (
                    <button
                      className="dash2-icon-action"
                      type="button"
                      onClick={() => void handleSubmit(product.id)}
                      disabled={isWorking === product.id}
                      aria-label="Yoxlamaya göndər"
                      title="Yoxlamaya göndər"
                    >
                      {isWorking === product.id ? <Loader2 className="spin-icon" size={15} /> : <Send size={15} />}
                    </button>
                  ) : (
                    <span className="dash2-icon-action is-muted" aria-hidden="true">
                      <EyeOff size={15} />
                    </span>
                  )}
                  <button
                    className="dash2-icon-action is-danger"
                    type="button"
                    onClick={() => void handleDelete(product.id)}
                    disabled={isWorking === product.id}
                    aria-label="Sil"
                    title="Sil"
                  >
                    <Trash2 size={15} />
                  </button>
                </span>
              </article>
            ))}
          </section>
        ) : (
          <section className="dash2-section">
            <div className="dash2-empty">
              <PackageSearch size={22} />
              <strong>Məhsul tapılmadı</strong>
              <span>Filtrləri dəyişin və ya yeni məhsul əlavə edin.</span>
              <Link className="dash2-cta" href="/seller/products/new">
                <Plus size={15} />
                Yeni məhsul
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
