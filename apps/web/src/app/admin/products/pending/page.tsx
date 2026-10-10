'use client';

import { useEffect, useState } from 'react';
import { getAdminProducts, type AdminProduct } from '../../../../lib/admin-api';
import { AdminPageHeader } from '../../admin-ui';
import { AdminProductTable } from '../product-table';

export default function PendingProductsPage() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAdminProducts({ status: 'PENDING_REVIEW', limit: '100' })
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
  }, []);

  return (
    <section className="admin-page">
      <AdminPageHeader
        kicker="Review queue"
        title="Yoxlama gözləyən məhsullar"
        description="Satıcıların public catalog-a göndərdiyi məhsullar burada təsdiq və ya rədd edilir."
      />
      <AdminProductTable items={items} isLoading={isLoading} hasError={hasError} />
    </section>
  );
}
