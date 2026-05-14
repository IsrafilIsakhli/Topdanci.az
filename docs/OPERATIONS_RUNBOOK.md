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

## SonarCloud Quality Gate

- SonarCloud must analyze `apps` and `packages` as production source.
- `design_review` is design reference material and must stay excluded from SonarCloud analysis.
- Review security hotspots manually; do not mark them safe without checking the code path.
- If SonarCloud reports high duplication, first confirm generated, design, lockfile, and migration files are excluded before refactoring production code.

## Rollback Defaults

- Web: roll back to the previous Vercel deployment.
- API: roll back to the previous container image.
- Database: restore from the latest verified backup only if migration rollback is not safe.
