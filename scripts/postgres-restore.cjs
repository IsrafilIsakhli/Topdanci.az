const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const { resolve } = require('node:path');

const databaseUrl = process.env.DATABASE_URL;
const backupFile = process.env.BACKUP_FILE ? resolve(process.env.BACKUP_FILE) : '';
const confirmation = process.env.RESTORE_CONFIRM;

if (!databaseUrl) {
  console.error('DATABASE_URL is required for database restore.');
  process.exit(1);
}

if (!backupFile || !existsSync(backupFile)) {
  console.error('BACKUP_FILE must point to an existing .dump file.');
  process.exit(1);
}

if (confirmation !== 'I_UNDERSTAND_THIS_RESTORES_DATABASE') {
  console.error('Set RESTORE_CONFIRM=I_UNDERSTAND_THIS_RESTORES_DATABASE to run restore.');
  process.exit(1);
}

const args = ['--clean', '--if-exists', '--no-owner', '--no-privileges', `--dbname=${databaseUrl}`, backupFile];
const result = spawnSync('pg_restore', args, { stdio: 'inherit', shell: process.platform === 'win32' });

if (result.status !== 0) {
  console.error('pg_restore failed. Restore only against staging or an explicitly approved recovery target.');
  process.exit(result.status ?? 1);
}

console.log('Database restore completed.');
