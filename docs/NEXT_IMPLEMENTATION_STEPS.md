# Next Implementation Steps

The foundation is ready. From here, build in this order so the platform stays
stable and does not turn into a fragile prototype.

## 1. Real Database Integration

- Replace fixture arrays in `categories`, `stores`, and `products` services with
  Prisma queries.
- Add repository files per module only when query logic becomes non-trivial.
- Keep public list endpoints cursor-paginated.
- Add indexes before adding expensive filters.

## 2. Authentication And Roles

- Implement seller/admin login.
- Add JWT access and refresh token flow.
- Add `Public`, `Roles`, and auth guards.
- Add store-member checks for seller dashboard routes.

## 3. Store Application Flow

- Persist `StoreApplication` records.
- Admin approves/rejects applications.
- Approval creates store, owner user, and store membership.
- Keep moderation audit logs for all admin decisions.

## 4. Product Management

- Seller creates product as `DRAFT`.
- Seller sends product to `PENDING_REVIEW`.
- Admin approves to `ACTIVE`.
- Public catalog shows only active products from active stores.

## 5. Image Pipeline

- API returns pre-signed S3 upload URLs.
- Browser uploads directly to S3.
- Worker validates image, generates variants, and marks `ProductImage.READY`.
- CDN serves only optimized variants.

## 6. Lead Tracking

- Track `PRODUCT_VIEW`, `STORE_VIEW`, `WHATSAPP_CLICK`, and `PHONE_REVEAL`.
- Hash IP/user-agent for abuse protection without storing sensitive raw data.
- Deduplicate repeated clicks per anonymous/session window.

## 7. Search

- Start with PostgreSQL full-text search.
- Move to Meilisearch or OpenSearch when catalog/search traffic justifies it.
- Keep search indexing async through a queue.

## 8. Caching

- CDN caches public pages and images.
- Redis caches hot category/store/product read models.
- Never cache seller/admin private data without user scoping.

## 9. Production Hardening

- Add structured logging.
- Add request metrics.
- Add smoke tests for public routes.
- Add backup/restore procedure for PostgreSQL.
- Add rate limits for auth, lead tracking, and media upload endpoints.

## Immediate Next Coding Task

Implement real Prisma-backed public catalog:

1. `CategoriesService.listPublicCategories`
2. `StoresService.listPublicStores`
3. `ProductsService.listPublicProducts`
4. Seed script validation with local Docker Postgres
