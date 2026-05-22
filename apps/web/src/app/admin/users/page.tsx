'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getAdminUsers, type AdminUser, type AdminUserRole, type AdminUserStatus } from '../../../lib/admin-api';
import { AdminEmptyBlock, AdminErrorBlock, AdminLoadingBlock, AdminPageHeader, AdminStatusBadge, formatDate } from '../admin-ui';

export default function AdminUsersPage() {
  const [role, setRole] = useState<AdminUserRole | ''>('');
  const [status, setStatus] = useState<AdminUserStatus | ''>('');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const params = useMemo(
    () => ({
      role: role || undefined,
      status: status || undefined,
      q: query.trim() || undefined,
      limit: '60',
    }),
    [query, role, status],
  );

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getAdminUsers(params)
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
  }, [params]);

  return (
    <section className="admin-page">
      <AdminPageHeader
        kicker="Superadmin"
        title="İstifadəçi və rol idarəsi"
        description="Rol və status dəyişiklikləri audit log-a düşür. Son SUPER_ADMIN qorunur."
      />
      <div className="admin-toolbar">
        <input className="admin-input" placeholder="Email, telefon və ya ad axtarın" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="admin-select" value={role} onChange={(event) => setRole(event.target.value as AdminUserRole | '')}>
          <option value="">Bütün rollar</option>
          <option value="BUYER">BUYER</option>
          <option value="SELLER">SELLER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
        </select>
        <select className="admin-select" value={status} onChange={(event) => setStatus(event.target.value as AdminUserStatus | '')}>
          <option value="">Bütün statuslar</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="DELETED">DELETED</option>
        </select>
      </div>

      <section className="admin-panel">
        {isLoading ? <AdminLoadingBlock /> : null}
        {hasError ? <AdminErrorBlock message="İstifadəçi siyahısı yalnız SUPER_ADMIN üçün açıqdır." /> : null}
        {!isLoading && !hasError && !items.length ? <AdminEmptyBlock title="İstifadəçi tapılmadı" /> : null}
        {!isLoading && !hasError && items.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>İstifadəçi</th>
                  <th>Rol</th>
                  <th>Status</th>
                  <th>Mağaza</th>
                  <th>Yaradıldı</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.fullName ?? user.email ?? user.phone ?? 'Adsız istifadəçi'}</strong>
                      <small>{user.email ?? user.phone ?? user.id}</small>
                    </td>
                    <td>
                      <AdminStatusBadge status={user.role} />
                    </td>
                    <td>
                      <AdminStatusBadge status={user.status} />
                    </td>
                    <td>{user.counts?.storeMembers ?? 0}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <Link className="admin-link-button" href={`/admin/users/${user.id}`}>
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
