import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { LeadType, StoreStatus, UserRole, UserStatus } from '@prisma/client';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaService } from './modules/prisma/prisma.service';
import { RedisService } from './modules/redis/redis.service';

describe('TopdanBazar API smoke e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const sessionCache = new Map<string, { cookies: string[]; csrfToken: string; userId: string }>();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    await app.get(RedisService).deleteByPrefix('auth:login:');
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects invalid login and authenticates seeded seller', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifier: 'seller@topdanci.az', password: 'wrong-password' })
      .expect(401);

    const login = await loginAs('seller@topdanci.az', 'Seller12345!');
    expect(login.cookies.length).toBeGreaterThan(0);
    expect(login.csrfToken).toBeTruthy();
  });

  it('keeps seller scoped and blocks admin-only endpoints', async () => {
    const seller = await loginAs('seller@topdanci.az', 'Seller12345!');

    await request(app.getHttpServer())
      .get('/api/v1/seller/overview')
      .set('Cookie', seller.cookies)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/admin/overview')
      .set('Cookie', seller.cookies)
      .expect(403);
  });

  it('prevents a seller from mutating another store product', async () => {
    const seller = await loginAs('seller@topdanci.az', 'Seller12345!');
    const products = await request(app.getHttpServer())
      .get('/api/v1/products?store=techwholesale-az')
      .expect(200);
    const foreignProductId = products.body.data[0].id;

    await request(app.getHttpServer())
      .patch(`/api/v1/seller/products/${foreignProductId}`)
      .set('Cookie', seller.cookies)
      .set('x-csrf-token', seller.csrfToken)
      .send({ description: 'Seller must not be able to edit a foreign store product' })
      .expect(403);
  });

  it('rejects private mutations without csrf token', async () => {
    const seller = await loginAs('seller@topdanci.az', 'Seller12345!');

    await request(app.getHttpServer())
      .post('/api/v1/seller/products')
      .set('Cookie', seller.cookies)
      .send({ storeId: 'missing-store', title: 'No CSRF Product' })
      .expect(403);
  });

  it('keeps public catalog limited to active products', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/products').expect(200);
    const titles = response.body.data.map((product: { title: string }) => product.title);

    expect(titles).not.toContain('Baku Tekstil Yeni Mehsul Review');
  });

  it('accepts numeric pagination queries across public and guarded lists', async () => {
    const categories = await request(app.getHttpServer()).get('/api/v1/categories').expect(200);
    expect(categories.body.meta).toEqual({ total: expect.any(Number), nextCursor: null });

    const products = await request(app.getHttpServer()).get('/api/v1/products?limit=3').expect(200);
    expect(products.body.data.length).toBeLessThanOrEqual(3);
    expect(products.body.meta).toMatchObject({ total: expect.any(Number) });
    expect(products.body.meta.nextCursor === null || typeof products.body.meta.nextCursor === 'string').toBe(true);

    const stores = await request(app.getHttpServer()).get('/api/v1/stores?limit=2').expect(200);
    expect(stores.body.data.length).toBeLessThanOrEqual(2);
    expect(stores.body.meta).toMatchObject({ total: expect.any(Number) });
    expect(stores.body.meta.nextCursor === null || typeof stores.body.meta.nextCursor === 'string').toBe(true);

    const seller = await loginAs('seller@topdanci.az', 'Seller12345!');
    const sellerProducts = await request(app.getHttpServer())
      .get('/api/v1/seller/products?limit=2')
      .set('Cookie', seller.cookies)
      .expect(200);
    expect(sellerProducts.body.data.length).toBeLessThanOrEqual(2);

    const sellerLeads = await request(app.getHttpServer())
      .get('/api/v1/seller/leads?limit=2')
      .set('Cookie', seller.cookies)
      .expect(200);
    expect(sellerLeads.body.data.length).toBeLessThanOrEqual(2);

    const admin = await loginAs('admin@topdanci.az', 'Admin12345!');
    const applications = await request(app.getHttpServer())
      .get('/api/v1/admin/store-applications?limit=2')
      .set('Cookie', admin.cookies)
      .expect(200);
    expect(applications.body.data.length).toBeLessThanOrEqual(2);
  });

  it('supports catalog sorting and returns real store aggregate statistics', async () => {
    for (const sort of ['newest', 'popular', 'price_asc', 'price_desc']) {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/products?limit=3&sort=${sort}`)
        .expect(200);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
    }

    for (const sort of ['newest', 'popular', 'products']) {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/stores?limit=2&sort=${sort}`)
        .expect(200);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.meta).toMatchObject({
        total: expect.any(Number),
        totalProducts: expect.any(Number),
        verifiedStores: expect.any(Number),
        totalViews: expect.any(Number),
      });
    }

    await request(app.getHttpServer()).get('/api/v1/products?sort=unknown').expect(400);
    await request(app.getHttpServer()).get('/api/v1/stores?sort=unknown').expect(400);
  });

  it('tracks only active public lead targets and deduplicates repeated views', async () => {
    const products = await request(app.getHttpServer()).get('/api/v1/products').expect(200);
    const product = products.body.data[0];
    const anonymousId = `lead-${Date.now()}`;

    await prisma.leadEvent.deleteMany({
      where: {
        type: LeadType.PRODUCT_VIEW,
        storeId: product.store.id,
        productId: product.id,
      },
    });

    const tracked = await request(app.getHttpServer())
      .post('/api/v1/leads')
      .set('User-Agent', 'topdanbazar-e2e-lead-agent')
      .send({
        type: 'PRODUCT_VIEW',
        storeId: product.store.id,
        productId: product.id,
        anonymousId,
        source: 'e2e',
      })
      .expect(201);

    expect(tracked.body.data.accepted).toBe(true);

    const duplicate = await request(app.getHttpServer())
      .post('/api/v1/leads')
      .set('User-Agent', 'topdanbazar-e2e-lead-agent')
      .send({
        type: 'PRODUCT_VIEW',
        storeId: product.store.id,
        productId: product.id,
        anonymousId,
        source: 'e2e',
      })
      .expect(201);

    expect(duplicate.body.data.deduplicated).toBe(true);

    const storedLead = await prisma.leadEvent.findFirstOrThrow({
      where: { anonymousId },
      orderBy: { createdAt: 'desc' },
      select: { ipHash: true, userAgentHash: true },
    });
    expect(storedLead.ipHash).toMatch(/^[a-f0-9]{64}$/);
    expect(storedLead.userAgentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(storedLead.userAgentHash).not.toContain('topdanbazar-e2e-lead-agent');

    const seller = await loginAs('seller@topdanci.az', 'Seller12345!');
    const sellerProducts = await request(app.getHttpServer())
      .get('/api/v1/seller/products')
      .set('Cookie', seller.cookies)
      .expect(200);
    const baseProduct = sellerProducts.body.data[0];
    const draft = await request(app.getHttpServer())
      .post('/api/v1/seller/products')
      .set('Cookie', seller.cookies)
      .set('x-csrf-token', seller.csrfToken)
      .send({
        storeId: baseProduct.store.id,
        categoryId: baseProduct.category.id,
        title: `Draft Lead Guard Product ${Date.now()}`,
        description: 'This draft must never be accepted as a public lead target.',
      })
      .expect(201);

    const rejectedDraftLead = await request(app.getHttpServer())
      .post('/api/v1/leads')
      .send({
        type: 'PRODUCT_VIEW',
        storeId: baseProduct.store.id,
        productId: draft.body.data.id,
        anonymousId: `draft-lead-${Date.now()}`,
      })
      .expect(201);

    expect(rejectedDraftLead.body.data).toEqual({
      accepted: false,
      reason: 'PRODUCT_NOT_FOUND',
    });
  });

  it('runs seller product review lifecycle through admin approval', async () => {
    const seller = await loginAs('seller@topdanci.az', 'Seller12345!');
    const sellerProducts = await request(app.getHttpServer())
      .get('/api/v1/seller/products')
      .set('Cookie', seller.cookies)
      .expect(200);
    const baseProduct = sellerProducts.body.data[0];
    const title = `E2E Wholesale Product ${Date.now()}`;

    const created = await request(app.getHttpServer())
      .post('/api/v1/seller/products')
      .set('Cookie', seller.cookies)
      .set('x-csrf-token', seller.csrfToken)
      .send({
        storeId: baseProduct.store.id,
        categoryId: baseProduct.category.id,
        title,
        description: 'Created by e2e to verify seller product workflow.',
        minOrderQuantity: 10,
      })
      .expect(201);

    expect(created.body.data.status).toBe('DRAFT');

    await request(app.getHttpServer())
      .patch(`/api/v1/seller/products/${created.body.data.id}`)
      .set('Cookie', seller.cookies)
      .set('x-csrf-token', seller.csrfToken)
      .send({})
      .expect(400);

    await request(app.getHttpServer())
      .patch(`/api/v1/seller/products/${created.body.data.id}`)
      .set('Cookie', seller.cookies)
      .set('x-csrf-token', seller.csrfToken)
      .send({ stockStatus: 'Hazir anbarda' })
      .expect(200);

    const submitted = await request(app.getHttpServer())
      .post(`/api/v1/seller/products/${created.body.data.id}/submit-review`)
      .set('Cookie', seller.cookies)
      .set('x-csrf-token', seller.csrfToken)
      .expect(201);

    expect(submitted.body.data.status).toBe('PENDING_REVIEW');

    const admin = await loginAs('admin@topdanci.az', 'Admin12345!');
    const pending = await request(app.getHttpServer())
      .get(`/api/v1/admin/products/pending?storeId=${baseProduct.store.id}&limit=100`)
      .set('Cookie', admin.cookies)
      .expect(200);

    expect(pending.body.data.some((product: { id: string }) => product.id === created.body.data.id)).toBe(true);

    const approved = await request(app.getHttpServer())
      .post(`/api/v1/admin/products/${created.body.data.id}/approve`)
      .set('Cookie', admin.cookies)
      .set('x-csrf-token', admin.csrfToken)
      .expect(201);

    expect(approved.body.data.status).toBe('ACTIVE');

    const publicProduct = await request(app.getHttpServer())
      .get(`/api/v1/products/${created.body.data.slug}`)
      .expect(200);

    expect(publicProduct.body.data.title).toBe(title);

    const pulledBackToDraft = await request(app.getHttpServer())
      .patch(`/api/v1/seller/products/${created.body.data.id}`)
      .set('Cookie', seller.cookies)
      .set('x-csrf-token', seller.csrfToken)
      .send({ description: 'Seller updated an approved product, so it must return to draft.' })
      .expect(200);

    expect(pulledBackToDraft.body.data.status).toBe('DRAFT');

    await request(app.getHttpServer()).get(`/api/v1/products/${created.body.data.slug}`).expect(404);
  });

  it('shows product rejection notes back to the seller', async () => {
    const seller = await loginAs('seller@topdanci.az', 'Seller12345!');
    const sellerProducts = await request(app.getHttpServer())
      .get('/api/v1/seller/products')
      .set('Cookie', seller.cookies)
      .expect(200);
    const baseProduct = sellerProducts.body.data[0];
    const title = `E2E Rejected Product ${Date.now()}`;
    const reviewNote = 'Şəkil keyfiyyəti zəifdir, məhsulu daha aydın təsvirlə yenidən göndərin.';

    const created = await request(app.getHttpServer())
      .post('/api/v1/seller/products')
      .set('Cookie', seller.cookies)
      .set('x-csrf-token', seller.csrfToken)
      .send({
        storeId: baseProduct.store.id,
        categoryId: baseProduct.category.id,
        title,
        description: 'Created by e2e to verify seller rejection feedback.',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/seller/products/${created.body.data.id}/submit-review`)
      .set('Cookie', seller.cookies)
      .set('x-csrf-token', seller.csrfToken)
      .expect(201);

    const admin = await loginAs('admin@topdanci.az', 'Admin12345!');
    const rejected = await request(app.getHttpServer())
      .post(`/api/v1/admin/products/${created.body.data.id}/reject`)
      .set('Cookie', admin.cookies)
      .set('x-csrf-token', admin.csrfToken)
      .send({ reviewNote })
      .expect(201);

    expect(rejected.body.data.status).toBe('REJECTED');

    const sellerView = await request(app.getHttpServer())
      .get(`/api/v1/seller/products/${created.body.data.id}`)
      .set('Cookie', seller.cookies)
      .expect(200);

    expect(sellerView.body.data.status).toBe('REJECTED');
    expect(sellerView.body.data.reviewNote).toBe(reviewNote);
  });

  it('rejects invalid media MIME for an owned seller product', async () => {
    const seller = await loginAs('seller@topdanci.az', 'Seller12345!');
    const products = await request(app.getHttpServer())
      .get('/api/v1/seller/products')
      .set('Cookie', seller.cookies)
      .expect(200);
    const productId = products.body.data[0].id;

    await request(app.getHttpServer())
      .post('/api/v1/media/upload-url')
      .set('Cookie', seller.cookies)
      .set('x-csrf-token', seller.csrfToken)
      .send({
        productId,
        fileName: 'vector.svg',
        contentType: 'image/svg+xml',
        sizeBytes: 1000,
      })
      .expect(400);
  });

  it('approves a store application once and prevents duplicate approval', async () => {
    const admin = await loginAs('admin@topdanci.az', 'Admin12345!');
    const suffix = Date.now().toString(36);
    const phoneSuffix = String(Date.now()).slice(-7);
    const application = await request(app.getHttpServer())
      .post('/api/v1/stores/applications')
      .send({
        contactName: 'E2E Seller',
        contactPhone: `+99450${phoneSuffix}`,
        contactEmail: `e2e-${suffix}@topdanci.az`,
        companyName: `E2E Wholesale ${suffix}`,
        city: 'Baki',
        description: 'E2E approval smoke test application',
      })
      .expect(201);

    const applicationId = application.body.data.id;
    const approved = await request(app.getHttpServer())
      .post(`/api/v1/admin/store-applications/${applicationId}/approve`)
      .set('Cookie', admin.cookies)
      .set('x-csrf-token', admin.csrfToken)
      .send({ reviewNote: 'Approved by e2e smoke test' })
      .expect(201);

    expect(approved.body.data.store.id).toBeTruthy();
    expect(approved.body.data.setup.token).toBeTruthy();

    const setupPassword = 'ApprovedSeller123!';
    await request(app.getHttpServer())
      .post('/api/v1/auth/setup-password')
      .send({ token: approved.body.data.setup.token, password: setupPassword })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifier: `e2e-${suffix}@topdanci.az`, password: setupPassword })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/admin/store-applications/${applicationId}/approve`)
      .set('Cookie', admin.cookies)
      .set('x-csrf-token', admin.csrfToken)
      .send({ reviewNote: 'Duplicate approval attempt' })
      .expect(400);
  });

  it('creates public support requests without requiring auth', async () => {
    const suffix = Date.now().toString(36);
    const email = `support-${suffix}@topdanci.az`;

    const response = await request(app.getHttpServer())
      .post('/api/v1/support/requests')
      .send({
        name: 'Support Sender',
        email,
        phone: '+994501112233',
        subject: 'Catalog support request',
        message: 'This is a public support request created by the e2e smoke test.',
      })
      .expect(201);

    expect(response.body.data.type).toBe('SUPPORT_REQUEST');

    const report = await prisma.report.findUniqueOrThrow({
      where: { id: response.body.data.id },
      select: { message: true, status: true },
    });

    expect(report.message).toContain(email);
    expect(report.status).toBe('OPEN');
  });

  it('enforces admin and superadmin operation boundaries', async () => {
    const admin = await loginAs('admin@topdanci.az', 'Admin12345!');

    await request(app.getHttpServer()).get('/api/v1/admin/users').set('Cookie', admin.cookies).expect(403);
    await request(app.getHttpServer()).get('/api/v1/admin/categories/tree').set('Cookie', admin.cookies).expect(403);
    await request(app.getHttpServer()).get('/api/v1/admin/system').set('Cookie', admin.cookies).expect(403);

    const superAdmin = await loginAs('superadmin@topdanci.az', 'SuperAdmin123!');

    await request(app.getHttpServer()).get('/api/v1/admin/users').set('Cookie', superAdmin.cookies).expect(200);
    await request(app.getHttpServer()).get('/api/v1/admin/categories/tree').set('Cookie', superAdmin.cookies).expect(200);
    await request(app.getHttpServer()).get('/api/v1/admin/system').set('Cookie', superAdmin.cookies).expect(200);

    const tempUser = await prisma.user.create({
      data: {
        email: `superadmin-boundary-${Date.now()}@topdanci.az`,
        role: UserRole.BUYER,
        status: UserStatus.ACTIVE,
      },
      select: { id: true },
    });

    const promoted = await request(app.getHttpServer())
      .patch(`/api/v1/admin/users/${tempUser.id}/role`)
      .set('Cookie', superAdmin.cookies)
      .set('x-csrf-token', superAdmin.csrfToken)
      .send({ role: UserRole.ADMIN })
      .expect(200);

    expect(promoted.body.data.role).toBe(UserRole.ADMIN);

    const suspended = await request(app.getHttpServer())
      .patch(`/api/v1/admin/users/${tempUser.id}/status`)
      .set('Cookie', superAdmin.cookies)
      .set('x-csrf-token', superAdmin.csrfToken)
      .send({ status: UserStatus.SUSPENDED })
      .expect(200);

    expect(suspended.body.data.status).toBe(UserStatus.SUSPENDED);

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/users/${superAdmin.userId}/status`)
      .set('Cookie', superAdmin.cookies)
      .set('x-csrf-token', superAdmin.csrfToken)
      .send({ status: UserStatus.SUSPENDED })
      .expect(403);
  });

  it('removes suspended stores from the public catalog and restores them after reactivation', async () => {
    const superAdmin = await loginAs('superadmin@topdanci.az', 'SuperAdmin123!');
    const activeStore = await prisma.store.findFirst({
      where: {
        status: StoreStatus.ACTIVE,
        products: { some: { status: 'ACTIVE' } },
      },
      select: { id: true, slug: true },
    });

    expect(activeStore).toBeTruthy();

    await request(app.getHttpServer())
      .post(`/api/v1/admin/stores/${activeStore!.id}/suspend`)
      .set('Cookie', superAdmin.cookies)
      .set('x-csrf-token', superAdmin.csrfToken)
      .send({ reviewNote: 'Suspended by superadmin e2e test' })
      .expect(201);

    await request(app.getHttpServer()).get(`/api/v1/stores/${activeStore!.slug}`).expect(404);

    await request(app.getHttpServer())
      .post(`/api/v1/admin/stores/${activeStore!.id}/reactivate`)
      .set('Cookie', superAdmin.cookies)
      .set('x-csrf-token', superAdmin.csrfToken)
      .expect(201);

    await request(app.getHttpServer()).get(`/api/v1/stores/${activeStore!.slug}`).expect(200);
  });

  async function loginAs(identifier: string, password: string): Promise<{ cookies: string[]; csrfToken: string; userId: string }> {
    const cached = sessionCache.get(identifier);

    if (cached) {
      return cached;
    }

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifier, password })
      .expect(200);
    const setCookie = response.headers['set-cookie'];
    const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
    const csrfToken = parseCookie(cookies, 'tb_csrf');

    const session = { cookies, csrfToken, userId: response.body.user.id };
    sessionCache.set(identifier, session);

    return session;
  }
});

function parseCookie(cookies: string[], name: string): string {
  const cookie = cookies.find((item) => item.startsWith(`${name}=`));

  if (!cookie) {
    return '';
  }

  return cookie.split(';')[0]?.slice(name.length + 1) ?? '';
}
