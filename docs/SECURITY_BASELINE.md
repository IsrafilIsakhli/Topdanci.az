# Security Baseline

Topdanci.az is a B2B lead-generation marketplace. Security defaults must protect
seller accounts, admin workflows, product data, and buyer contact intent without
adding e-commerce concepts.

## Current Baseline

- API uses Helmet, strict DTO validation, CORS origin allowlist, request IDs, and global exception handling.
- Rate limiting is enabled globally through `ThrottlerGuard` with Redis-backed storage in production and local fallback only outside production.
- Store applications, lead tracking, and media upload URLs have stricter endpoint limits.
- Public catalog queries must expose only `ACTIVE` products from `ACTIVE` stores.
- Lead tracking hashes IP and user-agent before storage.
- Production refuses weak JWT secrets.
- Auth uses httpOnly cookies for access/refresh tokens; refresh tokens are stored only as hashes in `RefreshSession`.
- Private state-changing endpoints require CSRF cookie/header matching through `tb_csrf` and `x-csrf-token`.
- Login brute-force protection uses Redis counters scoped by identifier and IP hash.
- Seller account setup uses one-time tokens stored only as hashes.
- Seller/admin APIs are protected by JWT and role guards, with store-level checks available through `RequireStoreMember`.
- Media upload signing validates product ownership before creating S3 pre-signed URLs.
- Media completion is queued for worker validation and optimized image variant generation.

## Rules For New Work

- Never log passwords, tokens, raw IP addresses, raw user-agent values, phone numbers, or signed S3 URLs.
- Seller/admin APIs must require auth guards and role/store-member checks.
- Admin moderation changes must create audit log records.
- Public APIs must paginate list responses and avoid unbounded database queries.
- API must never proxy large product images; browsers upload directly to S3 using pre-signed URLs.
- Swagger must remain disabled in production.

## Remaining Launch Blockers

- Wire production alert destinations for API errors, DB/Redis readiness, and media queue failures.
- Add broader API e2e coverage before the first public launch.
- Backup and restore drills must be tested before production launch.
