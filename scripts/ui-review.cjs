/* İzolyasiya edilmiş nümunə məlumatlarla dizayn və forma yoxlaması. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.UI_REVIEW_URL || 'http://localhost:3001';
const output = path.resolve('.artifacts/ui-review');
const date = '2026-10-08T01:43:00Z';
const counts = {
  PRODUCT_VIEW: 0,
  STORE_VIEW: 0,
  WHATSAPP_CLICK: 0,
  PHONE_REVEAL: 0,
  EMAIL_CLICK: 0,
};
const store = {
  id: 'review-store',
  slug: 'review-store',
  name: 'Uzun adlı topdansatış mağazası MMC',
  city: 'Bakı',
  district: 'Nərimanov',
  address: 'Atatürk prospekti 12',
  phone: '+994501119900',
  whatsappNumber: '+994501119900',
  email: 'review@example.az',
  status: 'ACTIVE',
  verified: true,
  productCount: 4,
  workingHours: { workdays: '09:00 - 18:00', saturday: '10:00 - 15:00', sunday: 'Bağlıdır' },
  createdAt: date,
  updatedAt: date,
  counts: { products: 4, members: 1, leadEvents: 0, reports: 1 },
  onboarding: {
    completed: 4,
    total: 5,
    percentage: 80,
    steps: [
      { key: 'images', label: 'Loqo və örtük şəkli', completed: false, href: '/seller/store' },
    ],
  },
};
const product = {
  id: 'review-product',
  slug: 'review-product',
  title: 'Uzun adlı məhsul: topdan satış üçün nümunə',
  status: 'ACTIVE',
  priceType: 'NEGOTIABLE',
  priceLabel: 'Razılaşma yolu ilə',
  currency: 'AZN',
  unit: 'ədəd',
  minOrderQuantity: '1',
  stockStatus: 'IN_STOCK',
  updatedAt: date,
  store,
  images: [],
  leadCounts: counts,
};
store.products = [product];
const application = {
  id: 'review-application',
  companyName: store.name,
  contactName: 'Nümunə satıcı',
  contactPhone: store.phone,
  city: 'Bakı',
  district: 'Nərimanov',
  status: 'PENDING',
  createdAt: date,
};
const report = {
  id: 'review-report',
  type: 'SUSPICIOUS_PRODUCT',
  message: 'Məhsul məlumatını yoxlamaq lazımdır.',
  status: 'OPEN',
  createdAt: date,
  product: { id: product.id, slug: product.slug, title: product.title },
  store: { id: store.id, slug: store.slug, name: store.name },
};
const audit = {
  id: 'review-audit',
  action: 'AUTH_LOGIN',
  resourceType: 'User',
  resourceId: 'review-user',
  createdAt: date,
};
const user = {
  id: 'review-user',
  role: 'SUPER_ADMIN',
  status: 'ACTIVE',
  email: 'review@example.az',
  createdAt: date,
  updatedAt: date,
  counts: { storeMembers: 1, ownedStores: 1, leadEvents: 0, reports: 0, auditLogs: 1 },
  storeMembers: [],
  ownedStores: [],
  recentAuditLogs: [audit],
};
const category = {
  id: 'review-category',
  name: 'Tikinti və təmir',
  slug: 'tikinti',
  status: 'ACTIVE',
  sortOrder: 0,
  counts: { products: 1, stores: 1, children: 0 },
  children: [],
};

// JSON cavablarında dairəvi əlaqə saxlanılmır.
const plainStore = {
  ...store,
  products: [
    {
      ...product,
      store: { id: store.id, slug: store.slug, name: store.name, status: store.status },
    },
  ],
};
const plainProduct = {
  ...product,
  store: { id: store.id, slug: store.slug, name: store.name, status: store.status },
};
const formsOnly = process.argv.includes('--forms-only');
const results = formsOnly ? JSON.parse(fs.readFileSync(path.join(output, 'results.json'), 'utf8')).results : [];
const failures = [];
let browser;

async function main() {
  fs.mkdirSync(output, { recursive: true });
  browser = await chromium.launch({
    headless: true,
    ...(process.env.UI_REVIEW_BROWSER ? { executablePath: process.env.UI_REVIEW_BROWSER } : {}),
  });
  const context = await browser.newContext();
  let role = 'SUPER_ADMIN';
  let nonzero = false;
  let mutations = [];
  await context.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const endpoint = url.pathname.replace('/api/v1', '');
    let body = { data: [] };
    if (request.method() !== 'GET') {
      mutations.push({ endpoint, body: request.postDataJSON() });
      body = {
        data: endpoint.startsWith('/seller/stores/')
          ? { ...plainStore, ...request.postDataJSON() }
          : { id: 'review-submission' },
      };
    } else if (endpoint === '/auth/session')
      body = { data: { authenticated: true, user: { ...user, role } } };
    else if (endpoint === '/seller/overview')
      body = {
        data: {
          totalProducts: 4,
          activeProducts: 2,
          pendingProducts: 1,
          draftProducts: 1,
          whatsappClicksToday: 0,
          storeViewsToday: 0,
          stores: [plainStore],
          recentLeads: [],
          topProducts: [],
        },
      };
    else if (endpoint === '/seller/stores') body = { data: [plainStore] };
    else if (endpoint === '/seller/products')
      body = {
        data: [plainProduct, { ...plainProduct, id: 'draft', status: 'DRAFT' }],
        meta: { total: 2 },
      };
    else if (endpoint.startsWith('/seller/products/')) body = { data: plainProduct };
    else if (endpoint === '/seller/analytics')
      body = {
        data: {
          range: '30d',
          totalLeads: 0,
          leadCounts: {
            productViews: 0,
            storeViews: 0,
            whatsappClicks: 0,
            phoneReveals: 0,
            emailClicks: 0,
          },
          productCounts: {
            draft: 1,
            pendingReview: 1,
            active: 2,
            passive: 0,
            rejected: 0,
            deleted: 0,
          },
        },
      };
    else if (endpoint === '/admin/overview')
      body = {
        data: {
          pendingStores: 1,
          pendingProducts: 1,
          reports: 1,
          openReports: 1,
          activeStores: 15,
          activeProducts: 46,
          todayLeadEvents: 0,
          whatsappClicksToday: 0,
          recentStoreApplications: [application],
          recentPendingProducts: [plainProduct],
          recentReports: [report],
          recentAuditLogs: [audit],
        },
      };
    else if (endpoint === '/admin/stores') body = { data: [plainStore], meta: { total: 1 } };
    else if (endpoint.startsWith('/admin/stores/')) body = { data: plainStore };
    else if (endpoint === '/admin/products')
      body = {
        data: [plainProduct, { ...plainProduct, id: 'pending', status: 'PENDING_REVIEW' }],
        meta: { total: 2 },
      };
    else if (endpoint.startsWith('/admin/products/')) body = { data: plainProduct };
    else if (endpoint === '/admin/store-applications') body = { data: [application] };
    else if (endpoint.startsWith('/admin/store-applications/')) body = { data: application };
    else if (endpoint === '/admin/reports') body = { data: [report] };
    else if (endpoint === '/admin/users') body = { data: [user] };
    else if (endpoint.startsWith('/admin/users/')) body = { data: user };
    else if (endpoint === '/admin/categories/tree' || endpoint === '/categories')
      body = { data: [category] };
    else if (endpoint === '/admin/audit-logs') body = { data: [audit] };
    else if (endpoint === '/admin/analytics')
      body = {
        data: {
          range: '90d',
          totalLeads: nonzero ? 42 : 0,
          leadCounts: counts,
          trend: nonzero
            ? Array.from({ length: 90 }, (_, i) => ({
                day: new Date(Date.UTC(2026, 7, i + 1)).toISOString(),
                count: i % 7,
              }))
            : [],
          topStores: [],
          topProducts: [],
          cityBreakdown: [],
          categoryBreakdown: [],
        },
      };
    else if (endpoint === '/admin/system')
      body = {
        data: {
          status: 'ok',
          dependencies: { database: { ok: true }, redis: { ok: true } },
          metrics: {
            requests: { count: 0, errors: 0, averageDurationMs: 0 },
            worker: { queueReady: true, workerReady: true, waiting: 0, active: 0, failed: 0 },
          },
          timestamp: date,
        },
      };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'access-control-allow-origin': new URL(base).origin,
        'access-control-allow-credentials': 'true',
        'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
        'access-control-allow-headers': 'content-type,x-csrf-token',
      },
      body: JSON.stringify(body),
    });
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  const routes = [
    '/',
    '/stores',
    '/products',
    '/contact',
    '/login',
    '/open-store',
    '/about',
    '/help',
    '/privacy',
    '/terms',
    '/seller',
    '/seller/products',
    '/seller/products/new',
    '/seller/products/review-product/edit',
    '/seller/store',
    '/seller/analytics',
    '/seller/leads',
    '/seller/settings',
    '/admin',
    '/admin/store-applications',
    '/admin/store-applications/review-application',
    '/admin/products',
    '/admin/products/pending',
    '/admin/products/review-product',
    '/admin/stores',
    '/admin/stores/review-store',
    '/admin/reports',
    '/admin/analytics',
    '/admin/users',
    '/admin/users/review-user',
    '/admin/categories',
    '/admin/audit-logs',
    '/admin/system',
  ];
  for (const width of formsOnly ? [] : [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    for (const route of routes) {
      role = route.startsWith('/seller') ? 'SELLER' : 'SUPER_ADMIN';
      pageErrors.length = 0;
      const response = await page.goto(`${base}${route}`, {
        waitUntil: 'networkidle',
        timeout: 60000,
      });
      await page.waitForTimeout(200);
      assert.equal(
        new URL(page.url()).pathname,
        route,
        `Səhifə gözlənilmədən yönləndirildi: ${route}`,
      );
      const layout = await page.evaluate(() => ({
        width: globalThis.innerWidth,
        scroll: globalThis.document.documentElement.scrollWidth,
        body: globalThis.document.body.scrollWidth,
        errors: [
          ...globalThis.document.querySelectorAll('.admin-state-card, .form-alert-error'),
        ].map((e) => e.textContent),
      }));
      const result = {
        route,
        width,
        status: response.status(),
        ...layout,
        pageErrors: [...pageErrors],
      };
      results.push(result);
      if (layout.scroll > width + 1 || response.status() >= 400 || pageErrors.length)
        failures.push(result);
      if (
        [390, 1440].includes(width) &&
        [
          '/',
          '/stores',
          '/products',
          '/contact',
          '/login',
          '/open-store',
          '/seller',
          '/seller/products',
          '/seller/store',
          '/seller/analytics',
          '/seller/settings',
          '/admin',
          '/admin/products',
          '/admin/stores',
          '/admin/reports',
          '/admin/analytics',
          '/admin/categories',
        ].includes(route)
      ) {
        await page.evaluate(async () => {
          for (
            let y = 0;
            y < globalThis.document.documentElement.scrollHeight;
            y += globalThis.innerHeight
          ) {
            globalThis.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
          globalThis.scrollTo(0, 0);
        });
        await page.addStyleTag({
          content:
            '.section, .card, .admin-panel, .report-card, .store-side-panel { content-visibility: visible !important; }',
        });
        await page.screenshot({
          path: path.join(
            output,
            `${width}-${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}.png`,
          ),
          fullPage: true,
        });
      }
    }
  }
  role = 'SELLER';
  await page.goto(`${base}/seller/store`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  mutations = [];
  await page.getByRole('checkbox', { name: 'Bağlıdır' }).first().check();
  await page.getByRole('button', { name: 'Profili yadda saxla' }).click();
  await page.getByRole('status').filter({ hasText: 'Mağaza profili yeniləndi.' }).waitFor();
  assert.equal(mutations.at(-1).body.workingHours.workdays, 'Bağlıdır');
  await page
    .getByLabel('Mağaza loqosunu seç')
    .setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('invalid') });
  await page.locator('.form-alert-error[role="alert"]').waitFor();
  assert.equal(mutations.length, 1, 'Yanlış fayl serverə göndərilməməlidir');
  await page.goto(`${base}/seller/analytics`, { waitUntil: 'networkidle' });
  const bars = await page
    .locator('.dash2-dist-bar i')
    .evaluateAll((elements) => elements.map((e) => e.style.width));
  assert.ok(bars.includes('0%'));
  role = 'ADMIN';
  await page.goto(`${base}/admin`, { waitUntil: 'networkidle' });
  assert.equal(
    await page.locator('a[href="/admin/system"],a[href="/admin/audit-logs"]').count(),
    0,
  );
  role = 'SUPER_ADMIN';
  nonzero = true;
  await page.goto(`${base}/admin/analytics`, { waitUntil: 'networkidle' });
  assert.ok((await page.locator('.dash2-chart-xlabel').count()) <= 7);
  await page.screenshot({ path: path.join(output, 'chart-90-days.png'), fullPage: true });
  await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('input[type="password"]').inputValue(), '');
  await page.goto(`${base}/contact`, { waitUntil: 'networkidle' });
  await page.getByLabel('Ad', { exact: true }).fill('Nümunə alıcı');
  await page.getByLabel('E-poçt', { exact: true }).fill('buyer@example.az');
  await page.locator('select[name="subject"]').selectOption({ index: 1 });
  await page.getByLabel('Mesaj', { exact: true }).fill('Mağaza açmaq haqqında məlumat istəyirəm.');
  await page.getByRole('button', { name: 'Müraciəti göndər' }).click();
  await page.locator('.form-alert-success[role="status"]').waitFor();
  assert.equal(await page.locator('.form-alert-error[role="alert"]').count(), 0);
  await browser.close();
  fs.writeFileSync(
    path.join(output, 'results.json'),
    JSON.stringify(
      {
        results,
        failures,
        checks: [
          'iş saatlarının saxlanılması',
          'faylın ilkin yoxlaması',
          'sıfır zolaqlar',
          'admin keçidləri',
          '90 günlük qrafik',
          'girişdə boş şifrə',
          'əlaqə forması',
        ],
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ pagesChecked: results.length, failures, output }, null, 2));
  if (failures.length) process.exitCode = 1;
}
main()
  .catch((error) => {
    console.error(error);
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(
      path.join(output, 'results.json'),
      JSON.stringify({ results, failures, error: error.message }, null, 2),
    );
    process.exitCode = 1;
  })
  .finally(() => browser?.close());
