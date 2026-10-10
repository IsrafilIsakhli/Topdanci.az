# Catalog

- `types.ts` defines the public preview and API response contracts.
- `demo-data.ts` owns the static product and store fixtures.
- `catalog-data.ts` loads live data, maps it for the UI, and applies the demo fallback.

Routes stay in `app/`. The old `lib/catalog-data.ts` path re-exports this feature
so existing screens can migrate without a broad import rewrite.
