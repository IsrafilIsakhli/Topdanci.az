#!/usr/bin/env node

const assert = require('node:assert/strict');

const apiBaseUrl = trimTrailingSlash(
  process.env.SMOKE_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.API_ORIGIN ? `${trimTrailingSlash(process.env.API_ORIGIN)}/api/v1` : ''),
);
const webBaseUrl = trimTrailingSlash(process.env.SMOKE_WEB_BASE_URL || process.env.WEB_ORIGIN || '');
const writeTestsEnabled = process.env.SMOKE_WRITE_TESTS === 'true';

if (!apiBaseUrl) {
  fail('Set SMOKE_API_BASE_URL or NEXT_PUBLIC_API_BASE_URL before running production smoke checks.');
}

const checks = [];

async function main() {
  await check('API health responds', async () => {
    const payload = await apiGet('/health');
    assert.ok(payload.status, 'health payload must include status');
  });

  await check('API readiness dependencies respond', async () => {
    const payload = await apiGet('/health/ready');
    assert.equal(payload.status, 'ready');
    assert.equal(payload.dependencies.database, 'ok', 'database must be ready');
    assert.equal(payload.dependencies.redis, 'ok', 'redis must be ready');
  });

  if (webBaseUrl) {
    await check('Web app responds', async () => {
      const response = await fetchWithTimeout(webBaseUrl, { method: 'GET' }, 10000);
      assert.ok(response.ok, `web returned ${response.status}`);
    });
  }

  await checkList('/categories', 'categories');
  await checkList('/products?limit=3', 'products');
  await checkList('/stores?limit=3', 'stores');

  await checkOptionalLogin('seller', process.env.SMOKE_SELLER_EMAIL, process.env.SMOKE_SELLER_PASSWORD, async (session) => {
    await apiGet('/seller/overview', session);
    await expectStatus('/admin/overview', 403, session);
  });

  await checkOptionalLogin('admin', process.env.SMOKE_ADMIN_EMAIL, process.env.SMOKE_ADMIN_PASSWORD, async (session) => {
    await apiGet('/admin/overview', session);
    await expectStatus('/admin/users', 403, session);
  });

  await checkOptionalLogin(
    'superadmin',
    process.env.SMOKE_SUPERADMIN_EMAIL,
    process.env.SMOKE_SUPERADMIN_PASSWORD,
    async (session) => {
      await apiGet('/admin/overview', session);
      await apiGet('/admin/system', session);
      await apiGet('/admin/users?limit=1', session);
    },
  );

  if (writeTestsEnabled) {
    await runWriteSmoke();
  } else {
    skip('Write smoke checks disabled. Set SMOKE_WRITE_TESTS=true with admin credentials to test application review.');
  }

  report();
}

async function checkList(path, label) {
  await check(`Public ${label} list responds with API shape`, async () => {
    const payload = await apiGet(path);
    assert.ok(Array.isArray(payload.data), `${label}.data must be an array`);
    assert.equal(typeof payload.meta, 'object', `${label}.meta must be an object`);
    assert.equal(typeof payload.meta.total, 'number', `${label}.meta.total must be a number`);
    assert.ok(
      payload.meta.nextCursor === null || typeof payload.meta.nextCursor === 'string',
      `${label}.meta.nextCursor must be null or a string`,
    );
  });
}

async function checkOptionalLogin(role, email, password, assertion) {
  if (!email || !password) {
    skip(`${role} login not checked. Set SMOKE_${role.toUpperCase()}_EMAIL and SMOKE_${role.toUpperCase()}_PASSWORD.`);
    return;
  }

  await check(`${role} login and guarded endpoints`, async () => {
    const session = await login(email, password);
    await assertion(session);
  });
}

async function runWriteSmoke() {
  const adminEmail = process.env.SMOKE_ADMIN_EMAIL || process.env.SMOKE_SUPERADMIN_EMAIL;
  const adminPassword = process.env.SMOKE_ADMIN_PASSWORD || process.env.SMOKE_SUPERADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('SMOKE_WRITE_TESTS requires SMOKE_ADMIN_* or SMOKE_SUPERADMIN_* credentials.');
  }

  await check('Store application create and reject flow', async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const application = await apiPost('/stores/applications', {
      contactName: 'Production Smoke Seller',
      contactPhone: `+99450${String(Date.now()).slice(-7)}`,
      contactEmail: `smoke-${suffix}@topdanci.az`,
      companyName: `Smoke Test Store ${suffix}`,
      city: 'Baki',
      description: 'Temporary production smoke application. Safe to reject.',
    });
    assert.ok(application.data.id, 'created application must include id');

    const admin = await login(adminEmail, adminPassword);
    const rejected = await apiPost(
      `/admin/store-applications/${application.data.id}/reject`,
      { reviewNote: 'Rejected by production smoke check' },
      admin,
    );
    assert.equal(rejected.data.status, 'REJECTED');
  });
}

async function login(identifier, password) {
  const response = await request('/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  assert.equal(response.status, 200, `login failed for ${identifier}`);
  const payload = await response.json();
  const cookies = getSetCookies(response);
  const csrfToken = parseCookie(cookies, 'tb_csrf');
  assert.ok(csrfToken, 'login must set csrf cookie');
  assert.ok(payload.user?.id, 'login response must include user');
  return { cookies, csrfToken };
}

async function apiGet(path, session) {
  const response = await request(path, withSession({ method: 'GET' }, session));
  assert.equal(response.status, 200, `${path} returned ${response.status}`);
  return response.json();
}

async function apiPost(path, body, session) {
  const response = await request(
    path,
    withSession(
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      },
      session,
    ),
  );
  assert.ok(response.status >= 200 && response.status < 300, `${path} returned ${response.status}`);
  return response.json();
}

async function expectStatus(path, status, session) {
  const response = await request(path, withSession({ method: 'GET' }, session));
  assert.equal(response.status, status, `${path} expected ${status}, got ${response.status}`);
}

async function request(path, init) {
  return fetchWithTimeout(`${apiBaseUrl}${path}`, init, 15000);
}

async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function withSession(init, session) {
  if (!session) {
    return init;
  }

  const headers = new Headers(init.headers);
  headers.set('cookie', session.cookies.map((cookie) => cookie.split(';')[0]).join('; '));

  if (!['GET', 'HEAD', 'OPTIONS'].includes(String(init.method || 'GET').toUpperCase())) {
    headers.set('x-csrf-token', session.csrfToken);
  }

  return {
    ...init,
    headers,
  };
}

async function check(name, run) {
  try {
    await run();
    checks.push({ name, status: 'PASS' });
    console.log(`[PASS] ${name}`);
  } catch (error) {
    checks.push({ name, status: 'FAIL', error });
    console.error(`[FAIL] ${name}`);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

function skip(name) {
  checks.push({ name, status: 'SKIP' });
  console.log(`[SKIP] ${name}`);
}

function report() {
  const failed = checks.filter((item) => item.status === 'FAIL').length;
  const passed = checks.filter((item) => item.status === 'PASS').length;
  const skipped = checks.filter((item) => item.status === 'SKIP').length;
  console.log(`\nProduction smoke summary: ${passed} passed, ${skipped} skipped, ${failed} failed.`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

function getSetCookies(response) {
  if (typeof response.headers.getSetCookie === 'function') {
    return response.headers.getSetCookie();
  }

  const cookie = response.headers.get('set-cookie');
  return cookie ? [cookie] : [];
}

function parseCookie(cookies, name) {
  const cookie = cookies.find((item) => item.startsWith(`${name}=`));
  return cookie?.split(';')[0]?.slice(name.length + 1) || '';
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
