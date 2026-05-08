# TopdanBazar Development Plan

## Phase 0: Foundation Documents

Status: in progress

Deliverables:

- PROJECT_SPEC.md
- ARCHITECTURE.md
- DATABASE_SCHEMA.md
- API_CONTRACTS.md
- DEVELOPMENT_PLAN.md

## Phase 1: Monorepo Foundation

Deliverables:

- npm workspace or pnpm workspace
- Turborepo
- apps/web
- apps/api
- packages/shared
- packages/config
- packages/ui
- TypeScript strict mode
- ESLint
- Prettier
- base env validation
- Docker compose for local PostgreSQL and Redis

## Phase 2: Backend Core

Deliverables:

- NestJS app
- Global config module
- Prisma module
- Health module
- Logger
- Global exception filter
- Validation pipe
- Auth module
- Users module
- Stores module
- Products module
- Categories module

## Phase 3: Database Foundation

Deliverables:

- Prisma schema
- Initial migration
- Seed categories
- Seed admin user
- Seed demo store/product data

## Phase 4: Frontend Foundation

Deliverables:

- Next.js app router
- Design tokens
- Public layout
- Auth layout
- Seller layout
- Admin layout
- UI primitives
- Product card
- Store card
- Data table
- Status badge
- Search/filter components

## Phase 5: Public Marketplace

Deliverables:

- Home
- Categories
- Products catalog
- Product details
- Stores list
- Store profile
- Contact
- Login
- Store application

## Phase 6: Seller Panel

Deliverables:

- Dashboard
- Product list
- Add product
- Edit product
- Store profile edit
- Leads list
- Basic analytics

## Phase 7: Admin Panel

Deliverables:

- Dashboard
- Store moderation
- Product moderation
- Users
- Categories
- Leads analytics
- Reports
- Audit logs
- Settings

## Phase 8: Media Pipeline

Deliverables:

- Signed upload URL
- S3 integration
- Product image metadata
- Worker for variants
- CDN URL strategy
- Upload validation

## Phase 9: Performance and Security

Deliverables:

- Redis rate limits
- Cache strategy
- Query indexes
- Pagination hardening
- RBAC hardening
- Ownership policies
- Security headers
- Audit logging

## Phase 10: Production Readiness

Deliverables:

- Sentry
- Structured logs
- CI build/test
- Staging deploy
- Production deploy
- Backups
- Basic load testing
- Runbook

## Immediate Next Step

Start Phase 1:

1. Initialize monorepo.
2. Create `apps/web` with Next.js.
3. Create `apps/api` with NestJS.
4. Create shared packages.
5. Add Docker compose for PostgreSQL and Redis.

