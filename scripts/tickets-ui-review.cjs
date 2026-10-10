/* Yazışma axını yalnız brauzerdəki nümunə cavablarla yoxlanır. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.UI_REVIEW_URL || 'http://localhost:3001';
const output = path.resolve('.artifacts/tickets-review');
const date = '2026-10-08T03:00:00Z';
const store = {
  id: 'review-store',
  name: 'Uzun adlı topdansatış mağazası MMC',
  city: 'Bakı',
  slug: 'review-store',
  status: 'ACTIVE',
  productCount: 4,
};
const results = [];
let browser;

async function main() {
  fs.mkdirSync(output, { recursive: true });
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.UI_REVIEW_BROWSER,
  });
  const context = await browser.newContext();
  let role = 'SELLER';
  let rejectReply = false;
  let calls = 0;
  let ticket = {
    id: 'review-ticket',
    number: 1234,
    subject: 'Məhsulun yoxlanması və mağaza məlumatları ilə bağlı müraciət',
    reason: 'PRODUCT_REVIEW',
    priority: 'HIGH',
    status: 'OPEN',
    version: 1,
    store,
    assigneeId: null,
    assignee: null,
    createdAt: date,
    updatedAt: date,
    _count: { messages: 1 },
    messages: [
      {
        id: 'message-1',
        kind: 'MESSAGE',
        authorRole: 'SELLER',
        author: { id: 'seller', fullName: 'Mağaza nümayəndəsi' },
        body: 'Məhsulun yoxlanılması ilə bağlı kömək istəyirəm.',
        createdAt: date,
      },
    ],
  };
  const detail = () => ({ data: ticket, meta: { nextCursor: null } });
  await context.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const endpoint = url.pathname.replace('/api/v1', '');
    const isTicket = endpoint.includes('/tickets');
    const data =
      request.method() === 'GET' || request.method() === 'OPTIONS' ? {} : request.postDataJSON();
    let status = 200;
    let body = { data: [] };
    if (endpoint === '/auth/session')
      body = {
        data: {
          authenticated: true,
          user: { id: role === 'SUPER_ADMIN' ? 'support' : 'seller', role, status: 'ACTIVE' },
        },
      };
    else if (endpoint === '/seller/stores') body = { data: [store] };
    else if (isTicket) {
      calls++;
      if (request.method() === 'OPTIONS') body = {};
      else if (request.method() === 'GET' && /\/tickets$/.test(endpoint)) {
        const filtered = ['status', 'reason', 'priority'].every(
          (key) => !url.searchParams.get(key) || url.searchParams.get(key) === ticket[key],
        );
        const counts = {
          OPEN: 0,
          IN_PROGRESS: 0,
          WAITING_SUPPORT: 0,
          WAITING_SELLER: 0,
          CLOSED: 0,
        };
        counts[ticket.status] = 1;
        body = {
          data: filtered ? [ticket] : [],
          meta: { total: filtered ? 1 : 0, totalPages: 1, page: 1, pageSize: 20, counts },
        };
      } else if (request.method() === 'GET') body = detail();
      else if (request.method() === 'POST' && /\/tickets$/.test(endpoint)) {
        ticket = {
          ...ticket,
          ...data,
          status: 'OPEN',
          version: 1,
          messages: [{ ...ticket.messages[0], body: data.message }],
        };
        body = { data: ticket };
        status = 201;
      } else if (request.method() === 'POST') {
        if (rejectReply) {
          status = 409;
          body = { error: { message: 'Müraciət yenilənib. Səhifəni yeniləyin.' } };
        } else {
          ticket = {
            ...ticket,
            version: ticket.version + 1,
            status: role === 'SUPER_ADMIN' ? 'WAITING_SELLER' : 'WAITING_SUPPORT',
            messages: [
              ...ticket.messages,
              {
                id: `message-${ticket.version + 1}`,
                body: data.message,
                kind: 'MESSAGE',
                authorRole: role,
                createdAt: date,
              },
            ],
          };
          body = detail();
        }
      } else if (request.method() === 'PATCH') {
        const note = data.message || 'Müraciətin vəziyyəti dəyişdi.';
        ticket = {
          ...ticket,
          ...data,
          version: ticket.version + 1,
          ...(data.claim !== undefined
            ? {
                assigneeId: data.claim ? 'support' : null,
                assignee: data.claim
                  ? { id: 'support', fullName: 'Dəstək məsulu', role: 'SUPER_ADMIN' }
                  : null,
              }
            : {}),
          messages: [
            ...ticket.messages,
            {
              id: `system-${ticket.version + 1}`,
              body: note,
              kind: 'SYSTEM',
              authorRole: role,
              createdAt: date,
            },
          ],
        };
        body = detail();
      }
    }
    await route.fulfill({
      status,
      contentType: 'application/json',
      headers: {
        'access-control-allow-origin': new URL(base).origin,
        'access-control-allow-credentials': 'true',
        'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
        'access-control-allow-headers': 'content-type,x-csrf-token',
      },
      body: JSON.stringify(body),
    });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      '/seller/tickets',
      '/seller/tickets/new',
      '/seller/tickets/review-ticket',
      '/admin/tickets',
      '/admin/tickets/review-ticket',
    ]) {
      role = route.startsWith('/admin') ? 'SUPER_ADMIN' : 'SELLER';
      errors.length = 0;
      const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
      await page.locator('.tickets-page h2').waitFor();
      await page.waitForTimeout(150);
      const scroll = await page.evaluate(() => globalThis.document.documentElement.scrollWidth);
      results.push({ route, width, scroll, status: response.status(), errors: [...errors] });
      assert.ok(scroll <= width + 1, `Daşma: ${route} ${width} / ${scroll}`);
      assert.equal(response.status(), 200);
      assert.equal(errors.length, 0);
      assert.equal(await page.locator('.form-alert-error').count(), 0);
      if ([390, 1440].includes(width))
        await page.screenshot({
          path: path.join(output, `${width}-${route.slice(1).replaceAll('/', '-')}.png`),
          fullPage: true,
        });
    }
  }
  role = 'SELLER';
  await page.goto(`${base}/seller/tickets/new`, { waitUntil: 'networkidle' });
  await page.getByLabel('Açılma səbəbi').selectOption('TECHNICAL');
  await page.getByLabel('Mövzu', { exact: true }).fill('Mağaza profilində texniki problem');
  await page.getByLabel('Problemin izahı').fill('Mağazanın məlumatları yenilənəndə xəta görünür.');
  await page.getByRole('button', { name: 'Müraciəti aç', exact: true }).click();
  await page.waitForURL('**/seller/tickets/review-ticket');
  await page.getByLabel('Cavabınız').fill('Problemin ekran görüntüsünü əlavə yoxladım.');
  await page.getByRole('button', { name: 'Cavabı göndər' }).click();
  await page.locator('.form-alert-success').waitFor();
  assert.equal(ticket.status, 'WAITING_SUPPORT');
  rejectReply = true;
  await page.getByLabel('Cavabınız').fill('Bu cavab uğursuz olsa da saxlanmalıdır.');
  await page.getByRole('button', { name: 'Cavabı göndər' }).click();
  await page.locator('.form-alert-error').waitFor();
  assert.equal(
    await page.getByLabel('Cavabınız').inputValue(),
    'Bu cavab uğursuz olsa da saxlanmalıdır.',
  );
  rejectReply = false;
  role = 'SUPER_ADMIN';
  await page.goto(`${base}/admin/tickets/review-ticket`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Üzərimə götür' }).click();
  await page.getByRole('button', { name: 'Ümumi növbəyə qaytar' }).waitFor();
  assert.equal(ticket.assigneeId, 'support');
  await page.getByLabel('Cavabınız').fill('Məlumatları yoxladıq, nəticəni təsdiqləyin.');
  await page.getByRole('button', { name: 'Cavabı göndər' }).click();
  await page.locator('.ticket-status.is-waiting_seller').waitFor();
  await page.getByLabel('Statusu dəyiş').selectOption('CLOSED');
  await page.getByLabel('Bağlanma səbəbi').fill('Mağazanın məlumatları düzəldildi.');
  await page.getByRole('button', { name: 'Müraciəti bağla' }).click();
  await page.locator('.ticket-closed-note').waitFor();
  assert.equal(await page.getByLabel('Cavabınız').count(), 0);
  await page.getByLabel('Statusu dəyiş').selectOption('OPEN');
  await page.getByRole('button', { name: 'Statusu yadda saxla' }).click();
  await page.getByLabel('Cavabınız').waitFor();
  role = 'ADMIN';
  calls = 0;
  await page.goto(`${base}/admin/tickets`, { waitUntil: 'networkidle' });
  assert.equal(calls, 0, 'Adi admin ticket API-sini çağırmamalıdır');
  assert.equal(await page.locator('a[href="/admin/tickets"]').count(), 0);
  fs.writeFileSync(
    path.join(output, 'results.json'),
    JSON.stringify(
      {
        results,
        checks: [
          'müraciətin açılması',
          'cavab və gözləmə statusu',
          'uğursuz cavab mətninin saxlanılması',
          'təyinat',
          'bağlanma səbəbi',
          'yenidən açılma',
          'adi adminə girişin bağlanması',
        ],
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ pagesChecked: results.length, workflows: 7, output }));
}
main()
  .catch((error) => {
    console.error(error);
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(
      path.join(output, 'results.json'),
      JSON.stringify({ results, error: error.message }, null, 2),
    );
    process.exitCode = 1;
  })
  .finally(() => browser?.close());
