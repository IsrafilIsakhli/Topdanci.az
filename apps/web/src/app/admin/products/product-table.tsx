import Link from 'next/link';
import type { AdminProduct } from '../../../lib/admin-api';
import { AdminEmptyBlock, AdminErrorBlock, AdminLoadingBlock, AdminStatusBadge, formatDate } from '../admin-ui';

export function AdminProductTable({
  items,
  isLoading,
  hasError,
}: {
  items: AdminProduct[];
  isLoading: boolean;
  hasError: boolean;
}) {
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
                  <td>
                    <strong>{product.title}</strong>
                    <small>{product.category?.name ?? 'Kateqoriya yoxdur'}</small>
                  </td>
                  <td>
                    <span>{product.store.name}</span>
                    <small>{product.store.status}</small>
                  </td>
                  <td>{product.priceLabel}</td>
                  <td>
                    <AdminStatusBadge status={product.status} />
                  </td>
                  <td>{formatDate(product.updatedAt)}</td>
                  <td>
                    <Link className="admin-link-button" href={`/admin/products/${product.id}`}>
                      Bax
                    </Link>
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
