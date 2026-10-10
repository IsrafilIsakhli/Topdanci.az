import Link from 'next/link';
import Image from 'next/image';
import { statusLabel } from '../../../lib/status-labels';
import type { AdminProduct } from '../../../lib/admin-api';
import { AdminEmptyBlock, AdminErrorBlock, AdminLoadingBlock, AdminStatusBadge, formatDate } from '../admin-ui';

export function AdminProductTable({
  items,
  isLoading,
  hasError,
  selectedIds = [],
  onToggle,
  onToggleAll,
  onFlag,
}: {
  items: AdminProduct[];
  isLoading: boolean;
  hasError: boolean;
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  onToggleAll?: () => void;
  onFlag?: (id: string) => void;
}) {
  const selectableItems = items.filter((item) => item.status === 'PENDING_REVIEW');
  const allSelected = selectableItems.length > 0 && selectableItems.every((item) => selectedIds.includes(item.id));

  return (
    <section className="admin-panel">
      {isLoading ? <AdminLoadingBlock /> : null}
      {hasError ? <AdminErrorBlock /> : null}
      {!isLoading && !hasError && !items.length ? <AdminEmptyBlock title="Məhsul tapılmadı" /> : null}
      {!isLoading && !hasError && items.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {onToggle ? (
                  <th className="admin-select-cell">
                    <input
                      aria-label="Bütün gözləyən məhsulları seç"
                      checked={allSelected}
                      onChange={onToggleAll}
                      type="checkbox"
                    />
                  </th>
                ) : null}
                <th>Məhsul</th>
                <th>Mağaza</th>
                <th>Qiymət</th>
                <th>Status</th>
                <th>Yenilənmə</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((product) => (
                <tr key={product.id}>
                  {onToggle ? (
                    <td className="admin-select-cell">
                      <input
                        aria-label={`${product.title} məhsulunu seç`}
                        checked={selectedIds.includes(product.id)}
                        disabled={product.status !== 'PENDING_REVIEW'}
                        onChange={() => onToggle(product.id)}
                        type="checkbox"
                      />
                    </td>
                  ) : null}
                  <td>
                    <div className="admin-product-identity">
                    <Image src={product.images?.find((image) => image.status === 'READY' && image.cdnUrl)?.cdnUrl ?? '/product-placeholder.svg'} alt="" width={44} height={44} unoptimized />
                    <div>
                    <strong>{product.title}</strong>
                    <small>{product.category?.name ?? 'Kateqoriya yoxdur'}</small>
                    {product.openReportCount ? <small className="admin-flag-label">{product.openReportCount} açıq işarə</small> : null}
                    </div>
                    </div>
                  </td>
                  <td>
                    <span>{product.store.name}</span>
                    <small>{statusLabel(product.store.status)}</small>
                  </td>
                  <td>{product.priceLabel}</td>
                  <td>
                    <AdminStatusBadge status={product.status} />
                  </td>
                  <td>{formatDate(product.updatedAt)}</td>
                  <td>
                    <div className="admin-row-actions">
                      {onFlag && product.status !== 'DELETED' ? (
                        <button className="admin-link-button admin-flag-button" title="Əlavə yoxlama üçün səbəb göstərərək işarələ" onClick={() => onFlag(product.id)} type="button">
                          İşarələ
                        </button>
                      ) : null}
                      <Link className="admin-link-button" href={`/admin/products/${product.id}`}>
                        Bax
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
