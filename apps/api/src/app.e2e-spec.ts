import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

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
