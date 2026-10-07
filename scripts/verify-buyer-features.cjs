const { PrismaClient } = require('@prisma/client');
const { spawnSync } = require('node:child_process');
require('dotenv').config({ quiet: true });
async function run() {
 const base = new URL(process.env.DATABASE_URL);
 if (!['localhost','127.0.0.1'].includes(base.hostname) || base.port !== '5433') throw Error('Yalnız lokal 5433 test bazası istifadə edilə bilər.');
 const redis = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379');
 if (!['localhost','127.0.0.1'].includes(redis.hostname)) throw Error('Yalnız lokal Redis ilə sınaq mümkündür.');
 redis.pathname = '/14';
 const name = 'codex_buyer_' + Date.now();
 if (!/^codex_buyer_\d+$/.test(name)) throw Error('Test bazasının adı uyğun deyil.');
 base.pathname = '/postgres'; const target = new URL(base); target.pathname = '/' + name;
 const admin = new PrismaClient({ datasources: { db: { url: base.toString() } } });
 let created = false;
 try {
  await admin.$executeRawUnsafe('CREATE DATABASE ' + name); created = true;
  const env = { ...process.env, DATABASE_URL: target.toString(), REDIS_URL: redis.toString(), PUSH_ENABLED: 'false' };
  for (const args of [
   ['node_modules/prisma/build/index.js','migrate','deploy','--schema','apps/api/prisma/schema.prisma'],
   ['node_modules/vitest/vitest.mjs','run','--root','apps/api','--config','vitest.e2e.config.ts','src/buyer-features.e2e-spec.ts']
  ]) { const result = spawnSync(process.execPath,args,{env,stdio:'inherit'}); if(result.status !== 0) throw Error('Alıcı imkanlarının yoxlanması tamamlanmadı.'); }
 } finally {
  if(created) await admin.$executeRawUnsafe('DROP DATABASE ' + name + ' WITH (FORCE)');
  await admin.$disconnect();
 }
}
run().catch(error=>{process.stderr.write(error.message+'\n');process.exitCode=1;});