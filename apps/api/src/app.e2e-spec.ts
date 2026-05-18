import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RedisService } from './modules/redis/redis.service';

describe('TopdanBazar API smoke e2e', () => {
  let app: INestApplication;

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

    await request(app.getHttpServer())
      .post(`/api/v1/admin/store-applications/${applicationId}/approve`)
      .set('Cookie', admin.cookies)
      .set('x-csrf-token', admin.csrfToken)
      .send({ reviewNote: 'Duplicate approval attempt' })
      .expect(400);
  });

  async function loginAs(identifier: string, password: string): Promise<{ cookies: string[]; csrfToken: string }> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifier, password })
      .expect(200);
    const setCookie = response.headers['set-cookie'];
    const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
    const csrfToken = parseCookie(cookies, 'tb_csrf');

    return { cookies, csrfToken };
  }
});

function parseCookie(cookies: string[], name: string): string {
  const cookie = cookies.find((item) => item.startsWith(`${name}=`));

  if (!cookie) {
    return '';
  }

  return cookie.split(';')[0]?.slice(name.length + 1) ?? '';
}
