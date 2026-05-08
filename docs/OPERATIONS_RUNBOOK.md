# Operations Runbook

## Local Verification

Run before pushing meaningful backend or frontend changes:

```bash
npm run prisma:generate
npm run prisma:validate
npm run typecheck
npm run build
npm audit --omit=dev
```

## Database Rules

- Use Prisma migrations for schema changes.
- Do not edit production tables manually.
- Keep public read filters aligned with visibility rules: active store and active product only.
- Take a database backup before production migrations.

## Production Health

- `/api/v1/health` checks API process health.
- `/api/v1/health/ready` checks database readiness.
- Future readiness checks should include Redis and S3 when those become required dependencies.

## Rollback Defaults

- Web: roll back to the previous Vercel deployment.
- API: roll back to the previous container image.
- Database: restore from the latest verified backup only if migration rollback is not safe.
