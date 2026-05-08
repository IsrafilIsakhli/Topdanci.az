# Security Baseline

Topdanci.az is a B2B lead-generation marketplace. Security defaults must protect
seller accounts, admin workflows, product data, and buyer contact intent without
adding e-commerce concepts.

## Current Baseline

- API uses Helmet, strict DTO validation, CORS origin allowlist, request IDs, and global exception handling.
- Rate limiting is enabled globally through `ThrottlerGuard`.
- Store applications, lead tracking, and media upload URLs have stricter endpoint limits.
- Public catalog queries must expose only `ACTIVE` products from `ACTIVE` stores.
- Lead tracking hashes IP and user-agent before storage.
- Production refuses weak JWT secrets.

## Rules For New Work

- Never log passwords, tokens, raw IP addresses, raw user-agent values, phone numbers, or signed S3 URLs.
- Seller/admin APIs must require auth guards and role/store-member checks.
- Admin moderation changes must create audit log records.
- Public APIs must paginate list responses and avoid unbounded database queries.
- API must never proxy large product images; browsers upload directly to S3 using pre-signed URLs.
- Swagger must remain disabled in production.

## Launch Blockers

- Auth guards and RBAC are not complete yet.
- Redis-backed rate limiting is required before horizontal API scaling.
- S3 upload signing and image worker processing are not complete yet.
- Backup and restore drills must be tested before production launch.
