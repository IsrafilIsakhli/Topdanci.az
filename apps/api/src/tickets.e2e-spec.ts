import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtTokenService } from './modules/auth/domain/jwt-token.service';
import { PushService } from './modules/notifications/push.service';
import { PrismaService } from './modules/prisma/prisma.service';

describe.skipIf(!/\/codex_ticket_\d+(?:\?|$)/.test(process.env.DATABASE_URL ?? ''))(
  'Ticket sistemi: ayrıca yerli baza',
  () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let seller: string,
      other: string,
      admin: string,
      superadmin: string,
      secondSuper: string,
      store: string,
      id: string;
    let version = 1;
    beforeAll(async () => {
      const url = new URL(process.env.DATABASE_URL!);
      if (
        !['localhost', '127.0.0.1'].includes(url.hostname) ||
        !/^\/codex_ticket_\d+$/.test(url.pathname)
      )
        throw new Error('Ayrıca yerli ticket test bazası tələb olunur.');
      const module = await Test.createTestingModule({ imports: [AppModule] })
        .overrideGuard(ThrottlerGuard)
        .useValue({ canActivate: () => true })
        .overrideProvider(PushService)
        .useValue({ enqueue: vi.fn().mockResolvedValue(undefined) })
        .compile();
      app = module.createNestApplication();
      app.setGlobalPrefix('api');
      app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
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
      seller = (await prisma.user.create({ data: { role: 'SELLER', fullName: 'Mağaza sahibi' } }))
        .id;
      other = (await prisma.user.create({ data: { role: 'SELLER' } })).id;
      admin = (await prisma.user.create({ data: { role: 'ADMIN' } })).id;
      superadmin = (
        await prisma.user.create({ data: { role: 'SUPER_ADMIN', fullName: 'Dəstək məsulu' } })
      ).id;
      secondSuper = (await prisma.user.create({ data: { role: 'SUPER_ADMIN' } })).id;
      store = (
        await prisma.store.create({
          data: {
            name: 'Ticket test mağazası',
            city: 'Bakı',
            slug: `ticket-test-${Date.now()}`,
            ownerUserId: seller,
          },
        })
      ).id;
    });
    afterAll(async () => {
      await app?.close();
    });
    const authorization = (id: string, role: UserRole) =>
      `Bearer ${app.get(JwtTokenService).createAccessToken({ id, role, status: 'ACTIVE' })}`;
    const sellerAuth = () => authorization(seller, 'SELLER');
    const supportAuth = () => authorization(superadmin, 'SUPER_ADMIN');
    const dto = () => ({
      storeId: store,
      subject: 'Məhsul yoxlaması gecikir',
      reason: 'PRODUCT_REVIEW',
      priority: 'HIGH',
      message: 'Məhsulu yoxlamaya göndərmişəm, nəticə görünmür.',
    });

    it('girişi, mağaza mənsubiyyətini və boş izahı yoxlayır', async () => {
      await request(app.getHttpServer()).post('/api/v1/seller/tickets').send(dto()).expect(401);
      const cookie = `tb_access=${sellerAuth().slice('Bearer '.length)}; tb_csrf=ticket-test-csrf`;
      await request(app.getHttpServer())
        .post('/api/v1/seller/tickets')
        .set('Cookie', cookie)
        .send(dto())
        .expect(403);
      await request(app.getHttpServer())
        .post('/api/v1/seller/tickets')
        .set('Cookie', cookie)
        .set('x-csrf-token', 'wrong-token')
        .send(dto())
        .expect(403);
      await request(app.getHttpServer())
        .post('/api/v1/seller/tickets')
        .set('Cookie', cookie)
        .set('x-csrf-token', 'ticket-test-csrf')
        .send({ ...dto(), reason: 'invalid' })
        .expect(400);
      await request(app.getHttpServer())
        .post('/api/v1/seller/tickets')
        .set('Authorization', authorization(other, 'SELLER'))
        .send(dto())
        .expect(403);
      await request(app.getHttpServer())
        .post('/api/v1/seller/tickets')
        .set('Authorization', sellerAuth())
        .send({ ...dto(), message: ' '.repeat(20) })
        .expect(400);
      await request(app.getHttpServer())
        .post('/api/v1/seller/tickets')
        .set('Authorization', sellerAuth())
        .send({ ...dto(), reason: 'unknown' })
        .expect(400);
    });
    it('səbəb, prioritet, nömrə və ilk yazışma ilə müraciət yaradır', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/seller/tickets')
        .set('Authorization', sellerAuth())
        .send(dto())
        .expect(201);
      id = response.body.data.id;
      version = response.body.data.version;
      expect(response.body.data.number).toBeGreaterThan(0);
      expect(response.body.data.status).toBe('OPEN');
      const detail = await request(app.getHttpServer())
        .get(`/api/v1/seller/tickets/${id}`)
        .set('Authorization', sellerAuth())
        .expect(200);
      expect(detail.body.data.messages).toHaveLength(1);
      expect(detail.body.data.messages[0].body).toBe(dto().message);
      expect(await prisma.notification.count({ where: { userId: superadmin } })).toBe(1);
    });
    it('başqa mağazanı və adi admini yazışmadan uzaq saxlayır', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/seller/tickets/${id}`)
        .set('Authorization', authorization(other, 'SELLER'))
        .expect(404);
      await request(app.getHttpServer())
        .get(`/api/v1/seller/tickets/${id}/messages`)
        .set('Authorization', authorization(other, 'SELLER'))
        .expect(404);
      const list = await request(app.getHttpServer())
        .get('/api/v1/seller/tickets')
        .set('Authorization', authorization(other, 'SELLER'))
        .expect(200);
      expect(list.body.data).toEqual([]);
      expect(list.body.meta.total).toBe(0);
      await request(app.getHttpServer())
        .get('/api/v1/admin/tickets')
        .set('Authorization', authorization(admin, 'ADMIN'))
        .expect(403);
      await request(app.getHttpServer())
        .get(`/api/v1/admin/tickets/${id}`)
        .set('Authorization', sellerAuth())
        .expect(403);
    });
    it('səbəbə, nömrəyə və statusa görə filtr edir', async () => {
      const list = await request(app.getHttpServer())
        .get('/api/v1/admin/tickets?reason=PRODUCT_REVIEW&status=OPEN&q=yoxlaması&pageSize=1')
        .set('Authorization', supportAuth())
        .expect(200);
      expect(list.body.data).toHaveLength(1);
      expect(list.body.meta.counts.OPEN).toBe(1);
      await request(app.getHttpServer())
        .get('/api/v1/admin/tickets?pageSize=100')
        .set('Authorization', supportAuth())
        .expect(400);
    });
    it('təyinatı saxlayır və başqa superadminin üstündən götürməsini bloklayır', async () => {
      const assigned = await request(app.getHttpServer())
        .patch(`/api/v1/admin/tickets/${id}`)
        .set('Authorization', supportAuth())
        .send({ version, claim: true })
        .expect(200);
      version = assigned.body.data.version;
      expect(assigned.body.data.assigneeId).toBe(superadmin);
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/tickets/${id}`)
        .set('Authorization', authorization(secondSuper, 'SUPER_ADMIN'))
        .send({ version, claim: true })
        .expect(409);
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/tickets/${id}`)
        .set('Authorization', supportAuth())
        .send({ version, claim: 'false' })
        .expect(400);
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/tickets/${id}`)
        .set('Authorization', authorization(secondSuper, 'SUPER_ADMIN'))
        .send({ version, claim: null })
        .expect(400);
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/tickets/${id}`)
        .set('Authorization', supportAuth())
        .send({ version: 2147483648, status: 'IN_PROGRESS' })
        .expect(400);
      await request(app.getHttpServer())
        .patch(`/api/v1/seller/tickets/${id}`)
        .set('Authorization', sellerAuth())
        .send({ version, priority: 'URGENT' })
        .expect(403);
    });
    it('cavabdan sonra gözləyən tərəfi dəyişir və köhnə versiyanı rədd edir', async () => {
      const oldVersion = version;
      const response = await request(app.getHttpServer())
        .post(`/api/v1/admin/tickets/${id}/messages`)
        .set('Authorization', supportAuth())
        .send({ version, message: 'Məhsulun keçidini göndərin.' })
        .expect(201);
      version = response.body.data.version;
      expect(response.body.data.status).toBe('WAITING_SELLER');
      await request(app.getHttpServer())
        .post(`/api/v1/seller/tickets/${id}/messages`)
        .set('Authorization', sellerAuth())
        .send({ version: oldVersion, message: 'Köhnə versiya ilə cavab.' })
        .expect(409);
      const answer = await request(app.getHttpServer())
        .post(`/api/v1/seller/tickets/${id}/messages`)
        .set('Authorization', sellerAuth())
        .send({ version, message: 'Məhsul keçidi: /products/test' })
        .expect(201);
      version = answer.body.data.version;
      expect(answer.body.data.status).toBe('WAITING_SUPPORT');
    });
    it('bağlanma səbəbini tələb edir, bağlı yazışmanı qoruyur və yenidən açır', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/tickets/${id}`)
        .set('Authorization', supportAuth())
        .send({ version, status: 'CLOSED' })
        .expect(400);
      const closed = await request(app.getHttpServer())
        .patch(`/api/v1/admin/tickets/${id}`)
        .set('Authorization', supportAuth())
        .send({ version, status: 'CLOSED', message: 'Problem həll olundu, məhsul təsdiqləndi.' })
        .expect(200);
      version = closed.body.data.version;
      expect(closed.body.data.closedAt).toBeTruthy();
      expect(closed.body.data.messages.at(-1).body).toContain('Problem həll olundu');
      await request(app.getHttpServer())
        .post(`/api/v1/seller/tickets/${id}/messages`)
        .set('Authorization', sellerAuth())
        .send({ version, message: 'Bağlı müraciətə cavab.' })
        .expect(409);
      const reopened = await request(app.getHttpServer())
        .patch(`/api/v1/seller/tickets/${id}`)
        .set('Authorization', sellerAuth())
        .send({ version, status: 'OPEN', message: 'Eyni problem yenidən baş verdi.' })
        .expect(200);
      version = reopened.body.data.version;
      expect(reopened.body.data.closedAt).toBeNull();
    });
    it('eyni versiya ilə iki status dəyişikliyindən yalnız birini saxlayır', async () => {
      const attempts = await Promise.all(
        ['IN_PROGRESS', 'WAITING_SELLER'].map((status) =>
          request(app.getHttpServer())
            .patch(`/api/v1/admin/tickets/${id}`)
            .set('Authorization', supportAuth())
            .send({ version, status }),
        ),
      );
      expect(attempts.map((response) => response.status).sort()).toEqual([200, 409]);
      const updated = await prisma.supportTicket.findUniqueOrThrow({ where: { id } });
      version = updated.version;
    });
    it('köhnə mesajları səhifələyir, idarə kodları və gizli məlumat göndərmir', async () => {
      const first = await request(app.getHttpServer())
        .get(`/api/v1/admin/tickets/${id}/messages?limit=2`)
        .set('Authorization', supportAuth())
        .expect(200);
      expect(first.body.data).toHaveLength(2);
      expect(first.body.meta.nextCursor).toBeTruthy();
      const second = await request(app.getHttpServer())
        .get(`/api/v1/admin/tickets/${id}/messages?limit=2&cursor=${first.body.meta.nextCursor}`)
        .set('Authorization', supportAuth())
        .expect(200);
      expect(
        second.body.data.some((message: { id: string }) =>
          first.body.data.some((firstMessage: { id: string }) => firstMessage.id === message.id),
        ),
      ).toBe(false);
      expect(JSON.stringify(first.body)).not.toContain('passwordHash');
      expect(
        await prisma.auditLog.count({ where: { resourceType: 'SupportTicket', resourceId: id } }),
      ).toBeGreaterThan(4);
    });
  },
);
