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

## Live Production Topology

Use this layout for the first stable live system:

- Web: Vercel project for `apps/web`.
- API: separate NestJS container host for `apps/api` (Render, Railway, Fly.io, DigitalOcean App Platform, or VPS Docker).
- Database: managed PostgreSQL, not a local Docker volume.
- Cache/queues: managed Redis with TLS when the provider supports it.
- Media: S3-compatible bucket plus public CDN base URL.

Set these Vercel web variables:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1
API_INTERNAL_BASE_URL=https://api.example.com/api/v1
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
AUTH_COOKIE_SAME_SITE=none
AUTH_COOKIE_SECURE=true
```

When the API and web are on the same registrable domain, `AUTH_COOKIE_DOMAIN=.example.com` can be used. Keep it empty for Vercel preview domains or unrelated API domains.

Production startup now refuses unsafe defaults: localhost origins, weak JWT secrets, missing Redis, missing metrics token, and missing production media/CDN settings fail fast.

## Local Data Services

- PostgreSQL runs on host port `55432`.
- Redis runs on host port `6379`.
- pgAdmin connection: host `127.0.0.1`, port `55432`, database/user/password `topdanbazar`.
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
