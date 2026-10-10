'use client';

import { useEffect, useState } from 'react';
import {
  getAdminUser,
  updateAdminUserRole,
  updateAdminUserStatus,
  type AdminUser,
  type AdminUserRole,
  type AdminUserStatus,
} from '../../../../lib/admin-api';
import {
  AdminErrorBlock,
  AdminListLink,
  AdminLoadingBlock,
  AdminMetricCard,
  AdminPageHeader,
  AdminStatusBadge,
  errorMessage,
  formatDate,
} from '../../admin-ui';

export function AdminUserDetailPage({ id }: { id: string }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    setIsLoading(true);
    try {
      const response = await getAdminUser(id);
      setUser(response.data);
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function changeRole(role: AdminUserRole) {
    setIsBusy(true);
    setMessage(null);
    try {
      const response = await updateAdminUserRole(id, role);
      setUser(response.data);
      setMessage('Rol yeniləndi.');
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  async function changeStatus(status: AdminUserStatus) {
    setIsBusy(true);
    setMessage(null);
    try {
      const response = await updateAdminUserStatus(id, status);
      setUser(response.data);
      setMessage('Status yeniləndi.');
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  if (isLoading) return <AdminLoadingBlock />;
  if (hasError || !user) return <AdminErrorBlock message="İstifadəçi tapılmadı və ya SUPER_ADMIN icazəsi yoxdur." />;

  return (
    <section className="admin-page">
      <AdminPageHeader
        kicker="İstifadəçi detalları"
        title={user.fullName ?? user.email ?? user.phone ?? user.id}
        description={`Yaradıldı: ${formatDate(user.createdAt)} · Son giriş: ${formatDate(user.lastLoginAt)}`}
        action={<AdminStatusBadge status={user.role} />}
      />
      {message ? <div className="admin-alert">{message}</div> : null}

      <div className="admin-stat-grid">
        <AdminMetricCard label="Store membership" value={user.counts?.storeMembers ?? 0} />
        <AdminMetricCard label="Owned store" value={user.counts?.ownedStores ?? 0} />
        <AdminMetricCard label="Lead event" value={user.counts?.leadEvents ?? 0} />
        <AdminMetricCard label="Audit" value={user.counts?.auditLogs ?? 0} />
      </div>

      <div className="admin-two-column">
        <section className="admin-panel">
          <h3>Rol və status</h3>
          <div className="admin-form-grid">
            <label>
              Rol
              <select className="admin-select" value={user.role} disabled={isBusy} onChange={(event) => void changeRole(event.target.value as AdminUserRole)}>
                <option value="BUYER">BUYER</option>
                <option value="SELLER">SELLER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </label>
            <label>
              Status
              <select className="admin-select" value={user.status} disabled={isBusy} onChange={(event) => void changeStatus(event.target.value as AdminUserStatus)}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="DELETED">DELETED</option>
              </select>
            </label>
          </div>
          <p className="admin-muted">Öz hesabınızı suspend etmək və ya son SUPER_ADMIN rolunu azaltmaq backend tərəfindən bloklanır.</p>
        </section>

        <section className="admin-panel">
          <h3>Mağaza əlaqələri</h3>
          <div className="admin-list">
            {user.storeMembers?.length ? (
              user.storeMembers.map((member) => (
                <AdminListLink
                  key={member.id}
                  href={`/admin/stores/${member.store.id}`}
                  title={member.store.name}
                  meta={`${member.role} · ${formatDate(member.createdAt)}`}
                  badge={<AdminStatusBadge status={member.store.status} />}
                />
              ))
            ) : (
              <span className="admin-muted">Mağaza əlaqəsi yoxdur.</span>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
