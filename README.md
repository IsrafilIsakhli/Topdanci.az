# TopdanBazar

Production-oriented B2B wholesale lead-generation marketplace.

This platform connects buyers with wholesale stores. It is not an e-commerce
checkout platform: there are no carts, orders, payments, shipping, or delivery
workflows in the core domain.

## Stack

- Frontend: Next.js App Router
- Backend: NestJS modular monolith
- Database: PostgreSQL + Prisma
- Cache/queues: Redis
- Media: S3-compatible object storage behind CDN
- Deployment target: Vercel for web, AWS for API and data layer

## First Commands

```bash
npm install
npm run prisma:generate
npm run typecheck
npm run build
```

For local infrastructure:

```bash
docker compose up -d postgres redis
npm run prisma:migrate
npm run prisma:seed
npm run dev:web
npm run dev:api
```

To run the whole stack with Docker after creating `.env` from `.env.example`:

```bash
docker compose --profile app up -d --build
```

## Workspace Layout

```text
apps/
  api/   NestJS modular monolith API
  web/   Next.js public, seller, and admin UI
packages/
  config/
  shared/
  ui/
docs/
  architecture and product contracts
```

Read `docs/CODEBASE_BLUEPRINT.md` before adding new modules.
