/* Yalnız ayrıca yerli bazada inteqrasiya testi; əsas bazaya test məlumatı yazılmır. */
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

async function main() {
  const config = dotenv.parse(fs.readFileSync('.env'));
  const url = new URL(process.env.DATABASE_URL || config.DATABASE_URL);
  if (!['localhost', '127.0.0.1'].includes(url.hostname))
    throw new Error('Yalnız yerli baza ilə işləyir.');
  const name = `codex_ticket_${Date.now()}`;
  const prisma = new PrismaClient({ datasources: { db: { url: url.href } } });
  try {
    await prisma.$executeRawUnsafe(`CREATE DATABASE "${name}"`);
  } finally {
    await prisma.$disconnect();
  }
  url.pathname = `/${name}`;
  const env = {
    ...process.env,
    ...config,
    DATABASE_URL: url.href,
    NODE_ENV: 'test',
    MEDIA_WORKER_ENABLED: 'false',
  };
  const run = (module, args, cwd = process.cwd()) => {
    const entry =
      module === 'vitest'
        ? require('node:path').join(
            require('node:path').dirname(require.resolve('vitest/package.json')),
            'vitest.mjs',
          )
        : require.resolve(module);
    const result = spawnSync(process.execPath, [entry, ...args], { env, cwd, stdio: 'inherit' });
    if (result.status !== 0) throw new Error('Ticket yoxlaması uğursuz oldu.');
  };
  run('prisma/build/index.js', ['migrate', 'deploy', '--schema', 'apps/api/prisma/schema.prisma']);
  run(
    'vitest',
    ['run', '--config', 'vitest.e2e.config.ts', 'src/tickets.e2e-spec.ts'],
    require('node:path').resolve('apps/api'),
  );
  console.log(`İzolyasiya edilmiş test bazası: ${name}`);
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
