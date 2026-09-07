'use client';

export type CatalogSortOption = {
  value: string;
  label: string;
};

type CatalogSortSelectProps = {
  ariaLabel: string;
  name: string;
  value: string;
  options: CatalogSortOption[];
  form?: string;
};

export function CatalogSortSelect({ ariaLabel, name, value, options, form }: CatalogSortSelectProps) {
  return (
    <select
      aria-label={ariaLabel}
      defaultValue={value}
      form={form}
      name={name}
      onChange={(event) => void event.currentTarget.form?.requestSubmit()}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
