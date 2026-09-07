#!/usr/bin/env node
/**
 * Production dependency audit gate.
 *
 * Runs `npm audit --omit=dev --json` and fails when a high or critical
 * vulnerability is found that is not explicitly allowlisted below.
 *
 * Allowlist entries must document why the advisory cannot be fixed right now.
 */

const { execSync } = require('node:child_process');

/**
 * Allowlisted GitHub advisory IDs (npm audit `via[].source` values).
 */
const ALLOWED_ADVISORY_SOURCES = new Set([
  // postcss advisories (XSS, source map file read, path traversal).
  // next@15.5.x pins postcss@8.4.31 exactly and npm ignores the override for it;
  // the only fix is the next@16 major upgrade. postcss is build-time only.
  1117015,
  1124252,
  1130709,
  1139510,
]);

const GATE_LEVELS = new Set(['high', 'critical']);

function loadAuditReport() {
  try {
    return execSync('npm audit --omit=dev --json', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (error) {
    // npm audit exits non-zero when vulnerabilities exist; stdout still holds the report.
    if (error.stdout) {
      return error.stdout;
    }
    console.error('audit-gate: npm audit could not run:', error.message);
    process.exit(2);
  }
}

const report = JSON.parse(loadAuditReport());
const vulnerabilities = report.vulnerabilities ?? {};
const blocking = [];

for (const [name, entry] of Object.entries(vulnerabilities)) {
  if (!GATE_LEVELS.has(entry.severity)) {
    continue;
  }

  const advisories = (entry.via ?? []).filter((via) => typeof via === 'object');
  const unallowed = advisories.filter((via) => !ALLOWED_ADVISORY_SOURCES.has(via.source));

  if (unallowed.length) {
    blocking.push({ name, severity: entry.severity, advisories: unallowed });
  }
}

if (blocking.length) {
  console.error('audit-gate: blocking production vulnerabilities found:\n');
  for (const item of blocking) {
    console.error(`  ${item.name} (${item.severity})`);
    for (const advisory of item.advisories) {
      console.error(`    - ${advisory.title}\n      ${advisory.url ?? ''}`);
    }
  }
  console.error('\nFix the dependencies or extend the allowlist in scripts/audit-gate.cjs with a written justification.');
  process.exit(1);
}

console.log('audit-gate: no blocking high/critical production vulnerabilities.');
