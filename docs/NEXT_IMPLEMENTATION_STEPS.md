# Next Implementation Steps

The foundation is ready. From here, build in this order so the platform stays
stable and does not turn into a fragile prototype.

## Completed Foundation

- Public catalog uses Prisma-backed category, store, and product queries.
- Auth foundation uses httpOnly cookies, access tokens, hashed refresh sessions, role guards, and seller scope checks.
- Redis-backed throttling/cache is wired for public read-heavy endpoints.
- S3 pre-signed product image upload URLs are protected by seller ownership checks.
- CI runs Prisma validation, typecheck, tests, build, and high-severity production audit.

## 1. Frontend Contract Integration

- Wire login forms to cookie auth and persist CSRF token handling in API client requests.
- Build admin screens against store application and product moderation APIs.
- Build seller product management screens against the scoped seller APIs.
- Keep all private mutations sending `x-csrf-token`.

## 2. Image Upload UX

- Browser requests `/media/upload-url`.
- Browser uploads directly to S3.
- Browser calls `/media/product-images/:id/complete`.
- UI shows processing, ready, and failed image states.

## 3. Search And Catalog Polish

- Improve PostgreSQL search ranking.
- Add category/store/product filters expected by the final design.
- Add SEO metadata for public catalog pages.

## 4. Remaining Admin Operations

- Suspend store/product/user actions.
- Report review flow.
- Admin audit log viewer.

## 5. Lead Tracking

- Track `PRODUCT_VIEW`, `STORE_VIEW`, `WHATSAPP_CLICK`, and `PHONE_REVEAL`.
- Hash IP/user-agent for abuse protection without storing sensitive raw data.
- Deduplicate repeated clicks per anonymous/session window.

## 6. Production Hardening

- Keep SonarCloud quality gate computed and passing for production source only.
- Review remaining Sonar reliability, security hotspot, and duplication findings after the design reference exclusion is applied.
- Add alerting.
- Add broader e2e smoke tests for public and private routes.
- Run backup/restore drills for PostgreSQL.

## Immediate Next Coding Task

Start frontend integration only after validating the API foundation locally with PostgreSQL, Redis, and the media worker enabled.
