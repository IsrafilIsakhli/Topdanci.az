'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getStoreApplications, type AdminApplicationStatus, type AdminStoreApplication } from '../../../lib/admin-api';
import { AdminEmptyBlock, AdminErrorBlock, AdminLoadingBlock, AdminPageHeader, AdminStatusBadge, formatDate } from '../admin-ui';

const statusOptions: Array<{ label: string; value: AdminApplicationStatus | '' }> = [
  { label: 'Bütün statuslar', value: '' },
  { label: 'Gözləyən', value: 'PENDING' },
  { label: 'Təsdiqlənmiş', value: 'APPROVED' },
  { label: 'Rədd edilmiş', value: 'REJECTED' },
];

export default function AdminStoreApplicationsPage() {
  const [status, setStatus] = useState<AdminApplicationStatus | ''>('PENDING');
  const [items, setItems] = useState<AdminStoreApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    getStoreApplications({ status: status || undefined, limit: '50' })
      .then((response) => {
        if (mounted) {
          setItems(response.data);
          setHasError(false);
        }
      })
      .catch(() => mounted && setHasError(true))
      .finally(() => mounted && setIsLoading(false));

    return () => {
      mounted = false;
    };
  }, [status]);

  return (
    <section className="admin-page">
      <AdminPageHeader
        kicker="Moderasiya"
        title="Mağaza müraciətləri"
        description="Yeni satıcı müraciətlərini yoxlayın, təsdiqləyin və ya səbəblə rədd edin."
        action={
          <select className="admin-select" value={status} onChange={(event) => setStatus(event.target.value as AdminApplicationStatus | '')}>
            {statusOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        }
      />

      <section className="admin-panel">
        {isLoading ? <AdminLoadingBlock /> : null}
        {hasError ? <AdminErrorBlock /> : null}
        {!isLoading && !hasError && !items.length ? (
          <AdminEmptyBlock title="Müraciət tapılmadı" description="Seçilmiş status üzrə mağaza müraciəti yoxdur." />
        ) : null}
        {!isLoading && !hasError && items.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Şirkət</th>
                  <th>Əlaqə</th>
                  <th>Şəhər</th>
                  <th>Status</th>
                  <th>Tarix</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.companyName}</strong>
                      <small>{item.taxNumber ?? 'VÖEN qeyd edilməyib'}</small>
                    </td>
                    <td>
                      <span>{item.contactName}</span>
                      <small>{item.contactPhone}</small>
                    </td>
                    <td>{item.district ? `${item.city}, ${item.district}` : item.city}</td>
                    <td>
                      <AdminStatusBadge status={item.status} />
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <Link className="admin-link-button" href={`/admin/store-applications/${item.id}`}>
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
    </section>
  );
}
