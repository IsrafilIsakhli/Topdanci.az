'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Edit3, EyeOff, Loader2, Plus, Search, Send, Trash2 } from 'lucide-react';
import {
  deleteSellerProduct,
  getCategoryOptions,
  getSellerProducts,
  submitSellerProduct,
  type CategoryOption,
  type ProductStatus,
  type SellerProduct,
} from '../../../lib/seller-api';

const statusLabels: Record<ProductStatus, string> = {
  DRAFT: 'Qaralama',
  PENDING_REVIEW: 'Yoxlamada',
  ACTIVE: 'Aktiv',
  PASSIVE: 'Passiv',
  REJECTED: 'Rədd edildi',
  DELETED: 'Silindi',
};

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
      <div className="seller-page-head seller-page-head-row">
        <div>
          <span className="seller-kicker">Məhsul idarəsi</span>
          <h2>Məhsullar</h2>
          <p>Mağazanızın bütün məhsullarını buradan yaradın, redaktə edin və yoxlamaya göndərin.</p>
        </div>
        <Link className="button button-primary" href="/seller/products/new">
          <Plus size={16} />
          Məhsul əlavə et
        </Link>
      </div>

      <section className="seller-card seller-filter-card">
        <label className="seller-search-field">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Məhsul adı və ya açıqlama üzrə axtar..." />
        </label>
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="">Bütün kateqoriyalar</option>
          {categories.map((category) => (
            <option value={category.id} key={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Bütün statuslar</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </section>

      {error ? <div className="form-alert form-alert-error">{error}</div> : null}

      <section className="seller-card seller-table-card">
        {isLoading ? (
          <div className="seller-table-loading">
            <Loader2 className="spin-icon" size={20} />
            Məhsullar yüklənir
          </div>
        ) : products.length ? (
          <div className="seller-product-list">
            {products.map((product) => (
              <article className="seller-product-row" key={product.id}>
                <span className="seller-product-thumb" style={{ backgroundImage: product.images[0]?.cdnUrl ? `url(${product.images[0].cdnUrl})` : undefined }}>
                  {!product.images[0]?.cdnUrl ? 'TB' : null}
                </span>
                <span className="seller-product-main">
                  <strong>{product.title}</strong>
                  <small>
                    {product.category?.name ?? 'Kateqoriyasız'} · {product.store.name}
                  </small>
                  {product.reviewNote ? <em>{product.reviewNote}</em> : null}
                </span>
                <span className={`seller-status seller-status-${product.status.toLowerCase().replace('_', '-')}`}>
                  {statusLabels[product.status]}
                </span>
                <span className="seller-price">{product.priceLabel}</span>
                <span className="seller-row-actions">
                  <Link className="seller-icon-button" href={`/seller/products/${product.id}/edit`} aria-label="Redaktə et">
                    <Edit3 size={16} />
                  </Link>
                  {['DRAFT', 'REJECTED', 'PASSIVE'].includes(product.status) ? (
                    <button className="seller-icon-button" type="button" onClick={() => void handleSubmit(product.id)} disabled={isWorking === product.id} aria-label="Yoxlamaya göndər">
                      {isWorking === product.id ? <Loader2 className="spin-icon" size={16} /> : <Send size={16} />}
                    </button>
                  ) : (
                    <span className="seller-icon-button seller-icon-muted">
                      <EyeOff size={16} />
                    </span>
                  )}
                  <button className="seller-icon-button seller-danger" type="button" onClick={() => void handleDelete(product.id)} disabled={isWorking === product.id} aria-label="Sil">
                    <Trash2 size={16} />
                  </button>
                </span>
              </article>
            ))}
          </div>
        ) : (
          <div className="seller-empty">
            <h3>Məhsul tapılmadı</h3>
            <p>Filtrləri dəyişin və ya yeni məhsul əlavə edin.</p>
            <Link className="button button-primary" href="/seller/products/new">
              <Plus size={16} />
              Yeni məhsul
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
