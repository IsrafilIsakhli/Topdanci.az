# Operations Runbook

## Local Verification

Run before pushing meaningful backend or frontend changes:

```bash
npm run prisma:generate
npm run prisma:validate
npm run prisma:deploy
npm run prisma:seed
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm audit --omit=dev --audit-level=high
```

For local foundation verification with PostgreSQL and Redis already running:

```bash
npm run verify:local
```

If local services are not ready:

```bash
docker compose up -d postgres redis
npm run check:local-services
```

## Database Rules

- Use Prisma migrations for schema changes.
- Do not edit production tables manually.
- Keep public read filters aligned with visibility rules: active store and active product only.
- Take a database backup before production migrations.

## Production Health

- `/api/v1/health` checks API process health.
- `/api/v1/health/ready` checks database and Redis readiness.
- `/api/v1/health/metrics` exposes in-process request and media worker queue metrics.
- S3 readiness is validated by media signing and worker processing paths.

## Production Smoke Checks

Run this after every production API or web deployment:

```bash
SMOKE_API_BASE_URL=https://api.example.com/api/v1 \
SMOKE_WEB_BASE_URL=https://topdanci-az.vercel.app \
SMOKE_SELLER_EMAIL=seller-demo@topdanci.az \
SMOKE_SELLER_PASSWORD=... \
SMOKE_ADMIN_EMAIL=admin@topdanci.az \
SMOKE_ADMIN_PASSWORD=... \
SMOKE_SUPERADMIN_EMAIL=superadmin@topdanci.az \
SMOKE_SUPERADMIN_PASSWORD=... \
npm run smoke:production
```

The default smoke run checks health, readiness, public catalog shape, login/session, seller access, admin access, and superadmin-only system access. It does not mutate production data.

To verify the store application write path, enable the guarded write check. It creates a temporary store application and immediately rejects it through admin credentials:

```bash
SMOKE_WRITE_TESTS=true npm run smoke:production
```

Do not enable write smoke checks unless admin credentials are present and the target environment is safe for a temporary rejected application record.

## Live Production Topology

Use this layout for the first stable live system:

- Web: Vercel project for `apps/web`.
- API: separate NestJS container host for `apps/api` (Render, Railway, Fly.io, DigitalOcean App Platform, or VPS Docker).
- Database: managed PostgreSQL, not a local Docker volume.
- Cache/queues: managed Redis with TLS when the provider supports it.
- Media: S3-compatible bucket plus public CDN base URL.

Set these Vercel web variables:

```bash
NEXT_PUBLIC_API_BASE_URL=/api/v1
API_INTERNAL_BASE_URL=https://api.example.com/api/v1
API_PROXY_ORIGIN=https://api.example.com
NEXT_PUBLIC_ENABLE_DEMO_FALLBACK=false
```

Set these API host variables:

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...
REDIS_URL=rediss://...
WEB_ORIGIN=https://topdanci-az.vercel.app
API_ORIGIN=https://api.example.com
JWT_ACCESS_SECRET=<32+ character random secret>
JWT_REFRESH_SECRET=<32+ character random secret>
LEAD_HASH_SALT=<32+ character random secret>
METRICS_TOKEN=<private token>
AWS_REGION=eu-central-1
AWS_S3_BUCKET=<bucket>
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
CDN_BASE_URL=https://cdn.example.com
AUTH_COOKIE_SAME_SITE=lax
AUTH_COOKIE_SECURE=true
```

With the Vercel rewrite enabled, browser calls stay on `/api/v1` and use first-party cookies. Server-side rendering calls Railway directly through `API_INTERNAL_BASE_URL`. Keep `AUTH_COOKIE_DOMAIN` empty for Vercel preview and production domains.

Production startup now refuses unsafe defaults: localhost origins, weak JWT secrets, missing Redis, missing metrics token, and missing production media/CDN settings fail fast.

Production seed is intentionally minimal. Set `TOPDANBAZAR_SUPERADMIN_EMAIL` and a unique `TOPDANBAZAR_SUPERADMIN_PASSWORD` of at least 16 characters, then run the seed once after migrations. It creates only the category tree and superadmin. Demo marketplace data cannot be written in production unless `ALLOW_PRODUCTION_DEMO_SEED=I_UNDERSTAND_THIS_WRITES_DEMO_DATA` is explicitly supplied.

## Local Data Services

- PostgreSQL runs on host port `5433`.
- Redis runs on host port `6379`.
- pgAdmin connection: host `127.0.0.1`, port `5433`, database/user/password `topdanbazar`.
- Seed users: `admin@topdanci.az` and `seller@topdanci.az`.

## Deployment Discipline

- Production schema changes use `prisma migrate deploy`, never manual table edits.
- Run migrations in staging first.
- Take a PostgreSQL backup before production migrations.
- Verify restore on staging before relying on a backup procedure.
- Keep SonarCloud quality gate passing on production source before frontend-heavy or launch work.

## Backup And Restore Commands

Create a PostgreSQL backup from the configured `DATABASE_URL`:

```bash
npm run db:backup
```

Restore only against staging or an explicitly approved recovery target:

```bash
BACKUP_FILE=backups/topdanci-example.dump RESTORE_CONFIRM=I_UNDERSTAND_THIS_RESTORES_DATABASE npm run db:restore:staging
```

Never run restore against production unless a recovery incident has been approved and the target backup has already been verified on staging.

## SonarCloud Quality Gate

- SonarCloud must analyze `apps` and `packages` as production source.
- `design_review` is design reference material and must stay excluded from SonarCloud analysis.
- Review security hotspots manually; do not mark them safe without checking the code path.
- If SonarCloud reports high duplication, first confirm generated, design, lockfile, and migration files are excluded before refactoring production code.

## Rollback Defaults

- Web: roll back to the previous Vercel deployment.
- API: roll back to the previous container image.
- Database: restore from the latest verified backup only if migration rollback is not safe.
