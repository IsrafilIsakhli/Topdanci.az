'use client';

import { useEffect, useState } from 'react';
import {
  createAdminCategory,
  deactivateAdminCategory,
  getAdminCategoryTree,
  reactivateAdminCategory,
  updateAdminCategory,
  type AdminCategory,
} from '../../../lib/admin-api';
import { AdminEmptyBlock, AdminErrorBlock, AdminLoadingBlock, AdminPageHeader, AdminStatusBadge, errorMessage } from '../admin-ui';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', parentId: '', icon: '', sortOrder: '0' });

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setIsLoading(true);
    try {
      const response = await getAdminCategoryTree();
      setCategories(response.data);
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    if (!form.name.trim()) return;
    setIsBusy(true);
    setMessage(null);
    try {
      await createAdminCategory({
        name: form.name.trim(),
        ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
        ...(form.parentId ? { parentId: form.parentId } : {}),
        ...(form.icon.trim() ? { icon: form.icon.trim() } : {}),
        sortOrder: Number(form.sortOrder) || 0,
      });
      setForm({ name: '', slug: '', parentId: '', icon: '', sortOrder: '0' });
      setMessage('Kateqoriya yaradıldı və public keş yeniləndi.');
      await load();
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  async function rename(category: AdminCategory) {
    const name = window.prompt('Yeni kateqoriya adı:', category.name);
    if (!name?.trim()) return;
    setIsBusy(true);
    setMessage(null);
    try {
      await updateAdminCategory(category.id, { name: name.trim() });
      setMessage('Kateqoriya yeniləndi.');
      await load();
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  async function toggle(category: AdminCategory) {
    setIsBusy(true);
    setMessage(null);
    try {
      if (category.status === 'ACTIVE') {
        await deactivateAdminCategory(category.id);
      } else {
        await reactivateAdminCategory(category.id);
      }
      setMessage('Kateqoriya statusu yeniləndi.');
      await load();
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  const flat = flattenCategories(categories);

  return (
    <section className="admin-page">
      <AdminPageHeader
        kicker="Superadmin"
        title="Kateqoriya idarəsi"
        description="Kateqoriyalar silinmir — statusla passiv edilir; slug və alt-kateqoriya strukturu qorunur."
      />
      {message ? <div className="admin-alert">{message}</div> : null}

      <div className="admin-two-column">
        <section className="admin-panel">
          <h3>Yeni kateqoriya</h3>
          <div className="admin-form-grid">
            <label>
              Ad
              <input className="admin-input" value={form.name} onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))} />
            </label>
            <label>
              Slug
              <input className="admin-input" value={form.slug} onChange={(event) => setForm((state) => ({ ...state, slug: event.target.value }))} />
            </label>
            <label>
              Parent
              <select className="admin-select" value={form.parentId} onChange={(event) => setForm((state) => ({ ...state, parentId: event.target.value }))}>
                <option value="">Əsas kateqoriya</option>
                {flat.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.path}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Icon
              <input className="admin-input" value={form.icon} onChange={(event) => setForm((state) => ({ ...state, icon: event.target.value }))} />
            </label>
          </div>
          <button className="button" type="button" disabled={isBusy} onClick={() => void handleCreate()}>
            Kateqoriya yarat
          </button>
        </section>

        <section className="admin-panel">
          <h3>Kateqoriya strukturu</h3>
          {isLoading ? <AdminLoadingBlock /> : null}
          {hasError ? <AdminErrorBlock message="Kateqoriya strukturu yalnız SUPER_ADMIN üçün açıqdır." /> : null}
          {!isLoading && !hasError && !categories.length ? <AdminEmptyBlock title="Kateqoriya yoxdur" /> : null}
          {!isLoading && !hasError ? (
            <div className="admin-tree">
              {categories.map((category) => (
                <CategoryNode key={category.id} category={category} disabled={isBusy} onRename={rename} onToggle={toggle} />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}

function CategoryNode({
  category,
  disabled,
  onRename,
  onToggle,
}: {
  category: AdminCategory;
  disabled: boolean;
  onRename: (category: AdminCategory) => void;
  onToggle: (category: AdminCategory) => void;
}) {
  return (
    <div className="admin-tree-node">
      <div>
        <span>{category.icon ?? 'folder'}</span>
        <strong>{category.name}</strong>
        <small>
          {category.counts.products} məhsul · {category.counts.children} alt kateqoriya
        </small>
      </div>
      <AdminStatusBadge status={category.status} />
      <button className="admin-link-button" type="button" disabled={disabled} onClick={() => onRename(category)}>
        Dəyiş
      </button>
      <button className="admin-link-button" type="button" disabled={disabled} onClick={() => onToggle(category)}>
        {category.status === 'ACTIVE' ? 'Passiv et' : 'Aktiv et'}
      </button>
      {category.children?.length ? (
        <div className="admin-tree-children">
          {category.children.map((child) => (
            <CategoryNode key={child.id} category={child} disabled={disabled} onRename={onRename} onToggle={onToggle} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function flattenCategories(categories: AdminCategory[], prefix = ''): Array<{ id: string; path: string }> {
  return categories.flatMap((category) => {
    const path = prefix ? `${prefix} / ${category.name}` : category.name;
    return [{ id: category.id, path }, ...flattenCategories(category.children ?? [], path)];
  });
}
