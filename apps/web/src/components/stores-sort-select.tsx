'use client';

import type { StoreSort } from '../lib/catalog-data';

type StoresSortSelectProps = {
  value: StoreSort;
};

export function StoresSortSelect({ value }: StoresSortSelectProps) {
  return (
    <select
      aria-label="Sırala"
      defaultValue={value}
      name="sort"
      onChange={(event) => void event.currentTarget.form?.requestSubmit()}
    >
      <option value="newest">Ən yenilər</option>
      <option value="popular">Ən çox baxılan</option>
      <option value="products">Ən çox məhsul</option>
    </select>
  );
}
