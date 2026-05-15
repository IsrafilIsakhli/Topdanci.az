const { spawnSync } = require('node:child_process');
const { mkdirSync } = require('node:fs');
const { resolve } = require('node:path');

const databaseUrl = process.env.DATABASE_URL;
const backupDir = resolve(process.env.BACKUP_DIR ?? 'backups');

if (!databaseUrl) {
  console.error('DATABASE_URL is required for database backups.');
  process.exit(1);
}

mkdirSync(backupDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputPath = resolve(backupDir, `topdanci-${timestamp}.dump`);
const args = ['--format=custom', '--no-owner', '--no-privileges', `--file=${outputPath}`, databaseUrl];
const result = spawnSync('pg_dump', args, { stdio: 'inherit', shell: process.platform === 'win32' });

if (result.status !== 0) {
  console.error('pg_dump failed. Ensure PostgreSQL client tools are installed and DATABASE_URL is reachable.');
  process.exit(result.status ?? 1);
}

console.log(`Backup written to ${outputPath}`);
