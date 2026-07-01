'use client';

import { ChevronDown, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
export type CategorySearchItem = {
  id?: string | undefined;
  parentId?: string | null | undefined;
  slug: string;
  name: string;
};

type CategorySearchFormProps = {
  categories: CategorySearchItem[];
};

type CategoryOption = {
  slug: string;
  label: string;
};

export function CategorySearchForm({ categories }: CategorySearchFormProps) {
  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState(tree.roots[0]?.slug ?? '');
  const [selected, setSelected] = useState<CategoryOption | null>(null);

  const activeRoot = tree.roots.find((category) => category.slug === activeSlug) ?? tree.roots[0] ?? null;
  const activeChildren = activeRoot ? tree.childrenOf(activeRoot) : [];

  function selectCategory(option: CategoryOption | null) {
    setSelected(option);
    setIsOpen(false);
  }

  return (
    <form className="category-search-form premium-search" action="/products">
      <label className="category-search-input">
        <Search size={18} />
        <input name="q" placeholder="Məhsul, mağaza və ya kateqoriya axtarın" />
      </label>

      <div className="category-mega-select">
        <input type="hidden" name="category" value={selected?.slug ?? ''} />
        <button
          className="category-mega-trigger"
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
        >
          <span>{selected?.label ?? 'Bütün kateqoriyalar'}</span>
          <ChevronDown size={17} />
        </button>

        {isOpen ? (
          <div className="category-mega-panel">
            <div className="category-mega-main" role="listbox" aria-label="Əsas kateqoriyalar">
              <button className="category-mega-all" type="button" onClick={() => selectCategory(null)}>
                Bütün kateqoriyalar
              </button>
              {tree.roots.map((category) => (
                <button
                  className={category.slug === activeRoot?.slug ? 'is-active' : ''}
                  type="button"
                  key={category.slug}
                  onFocus={() => setActiveSlug(category.slug)}
                  onMouseEnter={() => setActiveSlug(category.slug)}
                  onClick={() => setActiveSlug(category.slug)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="category-mega-detail">
              {activeRoot ? (
                <>
                  <div className="category-mega-head">
                    <strong>{activeRoot.name}</strong>
                    <button type="button" onClick={() => selectCategory({ slug: activeRoot.slug, label: activeRoot.name })}>
                      Seç
                    </button>
                  </div>
                  <div className="category-mega-groups">
                    {activeChildren.length ? (
                      activeChildren.map((child) => {
                        const grandchildren = tree.childrenOf(child);
                        return (
                          <div className="category-mega-group" key={child.slug}>
                            <button type="button" onClick={() => selectCategory({ slug: child.slug, label: child.name })}>
                              {child.name}
                            </button>
                            {grandchildren.length ? (
                              <div>
                                {grandchildren.map((grandchild) => (
                                  <button
                                    type="button"
                                    key={grandchild.slug}
                                    onClick={() => selectCategory({ slug: grandchild.slug, label: grandchild.name })}
                                  >
                                    {grandchild.name}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })
                    ) : (
                      <button type="button" onClick={() => selectCategory({ slug: activeRoot.slug, label: activeRoot.name })}>
                        {activeRoot.name}
                      </button>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <button className="button button-primary category-search-submit" type="submit">
        <Search size={17} />
        Axtar
      </button>
    </form>
  );
}

function buildCategoryTree(categories: CategorySearchItem[]) {
  const byParentId = new Map<string | null, CategorySearchItem[]>();

  categories.forEach((category) => {
    const parentId = category.parentId ?? null;
    byParentId.set(parentId, [...(byParentId.get(parentId) ?? []), category]);
  });

  const root = categories.find((category) => category.slug === 'son-elanlar');
  const roots = root ? byParentId.get(root.id ?? root.slug) ?? [] : byParentId.get(null) ?? [];

  return {
    roots,
    childrenOf(category: CategorySearchItem) {
      return byParentId.get(category.id ?? category.slug) ?? [];
    },
  };
}
