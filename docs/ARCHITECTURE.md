# TopdanBazar Architecture

## 1. Final Direction

TopdanBazar starts as a modular monolith with clear domain boundaries.

The goal is not to over-engineer with microservices at the start. The goal is to build a production-grade monolith that can later split into services when traffic, team size, or domain ownership requires it.

## 2. High-Level Architecture

```txt
User Browser
  |
  v
Cloudflare CDN / WAF
  |
  +--> Next.js Web App on Vercel
          |
          v
      NestJS API on AWS ECS/Fargate
          |
          +--> PostgreSQL / AWS RDS
          +--> Redis / ElastiCache
          +--> S3 for images
          +--> Queue / Worker
          +--> Search index later
```

## 3. Runtime Responsibilities

### Frontend

Next.js handles:

- Public catalog pages
- Seller panel UI
- Admin panel UI
- Server-side rendering where useful
- Client-side interactive filters
- Responsive layout
- Error boundaries
- Loading states

### Backend

NestJS handles:

- Auth
- Authorization
- Store ownership rules
- Product and store APIs
- Media metadata
- S3 signed uploads
- Lead event tracking
- Admin moderation
- Search orchestration
- Audit logging

### PostgreSQL

PostgreSQL stores source-of-truth relational data:

- Users
- Stores
- Products
- Categories
- Images metadata
- Leads
- Reports
- Audit logs

### S3 + Cloudflare

S3 stores original and generated image variants.

Cloudflare serves optimized images and static assets. The API must not proxy public images.

### Redis

Redis handles:

- Rate limiting
- Short-lived cache
- Hot category/product/store queries
- Session-related temporary state if needed
- Queue backend if BullMQ is used

### Queue / Worker

Workers handle:

- Image processing
- Search index updates
- Lead aggregation
- Notification dispatch
- Background cleanup jobs

## 4. Monorepo Structure

```txt
project-root/
  apps/
    web/
    api/

  packages/
    shared/
    config/
    ui/

  infrastructure/
    docker/
    aws/

  docs/
```

## 5. Backend Modular Monolith

```txt
apps/api/src/modules/
  auth/
  users/
  stores/
  products/
  categories/
  media/
  leads/
  search/
  admin/
  analytics/
  notifications/
  health/
```

Each module should expose a service boundary and should avoid reaching directly into another module's internals.

Preferred module shape:

```txt
module-name/
  module-name.module.ts
  module-name.controller.ts
  module-name.service.ts
  repositories/
  dto/
  policies/
  events/
  tests/
```

## 6. Frontend Structure

```txt
apps/web/src/
  app/
    (public)/
    (auth)/
    seller/
    admin/

  components/
    ui/
    layout/

  features/
    products/
    stores/
    categories/
    auth/
    seller/
    admin/

  lib/
    api/
    auth/
    config/
    formatters/
```

## 7. Reliability Rules

### Images

Never serve images through the API server.

Flow:

```txt
Seller browser
  -> API asks for signed upload URL
  -> Browser uploads directly to S3
  -> API stores metadata
  -> Worker creates variants
  -> Cloudflare serves optimized images
```

### Query Safety

All list endpoints must use pagination.

Public catalog endpoints should use cursor pagination where possible.

Avoid unbounded Prisma `include`.

Use explicit `select` for public list endpoints.

### Background Work

No image processing, search indexing, large exports, or analytics aggregation inside request/response paths.

### Error Handling

Backend:

- Global exception filter
- Request id
- Structured logs
- Health endpoint

Frontend:

- Error boundaries
- Loading skeletons
- Empty states
- API failure retry where safe

## 8. Caching Strategy

### CDN Cache

Use for:

- Product images
- Store logos/covers
- Static assets
- Public pages where safe

### Redis Cache

Use for:

- Home page featured blocks
- Popular categories
- Store summary
- Product list hot filters
- Rate limit counters

### Database Optimization

Use:

- Indexes
- Cursor pagination
- Read replicas later
- Materialized read models later

Avoid:

- Caching everything without invalidation
- Long TTL on frequently edited product/store data

## 9. Search Evolution

Phase 1:

- PostgreSQL full-text search
- Trigram search
- Indexed filters

Phase 2:

- Typesense, Meilisearch, or OpenSearch
- Async index updates through queue events

Do not couple product writes directly to external search engine availability.

## 10. Microservice Split Triggers

Do not split at launch.

Split later when:

- Image processing impacts API
- Search traffic becomes heavy
- Lead events become high-volume
- Admin/seller/public surfaces need independent scaling
- Team ownership requires isolated services

Likely first splits:

- Media service
- Search service
- Analytics/lead service
- Notification service

## 11. Deployment Direction

Recommended:

```txt
Frontend: Vercel
API: AWS ECS Fargate
Database: AWS RDS PostgreSQL
Redis: AWS ElastiCache
Storage: AWS S3
CDN/WAF: Cloudflare
Queue: BullMQ with Redis or AWS SQS
Logs: CloudWatch + Sentry
CI/CD: GitHub Actions
```

Environments:

- local
- staging
- production

Production changes must go through staging first.

