import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaService } from './modules/prisma/prisma.service';
import { JwtTokenService } from './modules/auth/domain/jwt-token.service';
import { PushService } from './modules/notifications/push.service';
import { NotificationsService } from './modules/notifications/notifications.service';
describe('Alıcı imkanları — ayrıca lokal baza',()=>{
 let app:INestApplication;let prisma:PrismaService;let buyer:string,seller:string,other:string,store:string,foreign:string,requestId:string,managementToken:string,access:string,code:string;
 const run=Date.now().toString(36);
 beforeAll(async()=>{
  const url=new URL(process.env.DATABASE_URL!);
  if(!['localhost','127.0.0.1'].includes(url.hostname)||!/^\/codex_buyer_\d+$/.test(url.pathname))throw new Error('Ayrıca lokal test bazası tələb olunur.');
  const mod=await Test.createTestingModule({imports:[AppModule]}).overrideGuard(ThrottlerGuard).useValue({canActivate:()=>true}).compile();
  app=mod.createNestApplication();app.setGlobalPrefix('api');app.enableVersioning({type:VersioningType.URI,defaultVersion:'1'});app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true,transformOptions:{enableImplicitConversion:true}}));await app.init();prisma=app.get(PrismaService);
  const hash=await bcrypt.hash('BeforePassword9',12);
  buyer=(await prisma.user.create({data:{email:run+'buyer@sample.az',role:'BUYER',passwordHash:hash}})).id;
  seller=(await prisma.user.create({data:{email:run+'seller@sample.az',role:'SELLER',passwordHash:hash}})).id;
  other=(await prisma.user.create({data:{email:run+'other@sample.az',role:'SELLER',passwordHash:hash}})).id;
  store=(await prisma.store.create({data:{slug:run+'-shop',name:'Sınaq mağazası',city:'Bakı',status:'ACTIVE',ownerUserId:seller,members:{create:{userId:seller,role:'OWNER'}}}})).id;
  foreign=(await prisma.store.create({data:{slug:run+'-foreign',name:'Başqa mağaza',city:'Gəncə',status:'ACTIVE',ownerUserId:other,members:{create:{userId:other,role:'OWNER'}}}})).id;
 },30000);
 afterAll(async()=>{vi.unstubAllGlobals();await app?.close();});
 function token(id:string,role:UserRole){return app.get(JwtTokenService).createAccessToken({id,role,status:'ACTIVE'});}
 it('tələb yaradır və idarə açarını ictimai cavablardan gizlədir',async()=>{
  const res=await request(app.getHttpServer()).post('/api/v1/buyer-requests').set('Authorization','Bearer '+token(buyer,'BUYER')).send({title:'Pambıq köynəklər',quantity:300,unit:'ədəd',city:'Bakı',description:'Ağ rəngdə'}).expect(201);
  requestId=res.body.data.request.id;managementToken=res.body.data.managementToken;expect(managementToken).toMatch(/^[a-f0-9]{64}$/);
  const list=await request(app.getHttpServer()).get('/api/v1/buyer-requests').expect(200);
  expect(JSON.stringify(list.body)).not.toContain(managementToken);expect(JSON.stringify(list.body)).not.toContain('managementHash');expect(JSON.stringify(list.body)).not.toContain(buyer);
  await request(app.getHttpServer()).post('/api/v1/buyer-requests/'+requestId+'/manage').send({token:'0'.repeat(64)}).expect(403);
 });
 it('miqdar yoxlaması və yad mağazanın təklifini bloklayır',async()=>{
  await request(app.getHttpServer()).post('/api/v1/buyer-requests').send({title:'Köynək',quantity:0,unit:'ədəd',city:'Bakı'}).expect(400);
  await request(app.getHttpServer()).post('/api/v1/buyer-requests/'+requestId+'/offers').set('Authorization','Bearer '+token(seller,'SELLER')).send({storeId:foreign,message:'Uyğun məhsulumuz stokdadır.'}).expect(403);
  await request(app.getHttpServer()).post('/api/v1/buyer-requests/'+requestId+'/offers').send({storeId:store,message:'Uyğun məhsulumuz stokdadır.'}).expect(401);
 });
 it('təklifləri yeniləyir və yalnız tələb sahibinə göstərir',async()=>{
  const offer=()=>request(app.getHttpServer()).post('/api/v1/buyer-requests/'+requestId+'/offers').set('Authorization','Bearer '+token(seller,'SELLER'));
  await offer().send({storeId:store,price:5.5,message:'300 ədəd məhsul stokdadır.'}).expect(201);
  await offer().send({storeId:store,price:5.2,message:'Qiyməti yenilədik, stokdadır.'}).expect(201);
  const publicDetail=await request(app.getHttpServer()).get('/api/v1/buyer-requests/'+requestId).expect(200);
  expect(publicDetail.body.data.offers).toBeUndefined();expect(publicDetail.body.data._count.offers).toBe(1);
  const owner=await request(app.getHttpServer()).post('/api/v1/buyer-requests/'+requestId+'/manage').send({token:managementToken}).expect(201);
  expect(owner.body.data.offers).toHaveLength(1);expect(Number(owner.body.data.offers[0].price)).toBe(5.2);
  const notices=await request(app.getHttpServer()).get('/api/v1/notifications?limit=1').set('Authorization','Bearer '+token(buyer,'BUYER')).expect(200);
  expect(notices.body.data[0].href).toBe('/requests/'+requestId);expect(notices.body.meta.nextCursor).toBeTruthy();
 });
 it('bağlı və vaxtı keçmiş tələbə yeni təklif vermir',async()=>{
  await request(app.getHttpServer()).post('/api/v1/buyer-requests/'+requestId+'/close').send({token:managementToken}).expect(201);
  await request(app.getHttpServer()).post('/api/v1/buyer-requests/'+requestId+'/offers').set('Authorization','Bearer '+token(seller,'SELLER')).send({storeId:store,message:'Bu artıq qəbul edilməməlidir.'}).expect(400);
  expect((await request(app.getHttpServer()).get('/api/v1/buyer-requests')).body.data).toHaveLength(0);
  await prisma.buyerRequest.update({where:{id:requestId},data:{status:'ACTIVE',expiresAt:new Date(0)}});
  await request(app.getHttpServer()).post('/api/v1/buyer-requests/'+requestId+'/offers').set('Authorization','Bearer '+token(seller,'SELLER')).send({storeId:store,message:'Bu da qəbul edilməməlidir.'}).expect(400);
 });
 it('tələbi hesaba bağlayır, başqa cihazda açır və yad hesabı bloklayır',async()=>{
  const guest=await request(app.getHttpServer()).post('/api/v1/buyer-requests').send({title:'Test qutuları',quantity:100,unit:'ədəd',city:'Bakı'}).expect(201);
  const id=guest.body.data.request.id,secret=guest.body.data.managementToken;
  await request(app.getHttpServer()).post('/api/v1/buyer-requests/'+id+'/claim').set('Authorization','Bearer '+token(buyer,'BUYER')).send({token:secret}).expect(201);
  const mine=await request(app.getHttpServer()).get('/api/v1/buyer-requests/mine').set('Authorization','Bearer '+token(buyer,'BUYER')).expect(200);
  expect(mine.body.data.some((r:{id:string})=>r.id===id)).toBe(true);
  await request(app.getHttpServer()).get('/api/v1/buyer-requests/'+id+'/owned').set('Authorization','Bearer '+token(other,'SELLER')).expect(404);
  await request(app.getHttpServer()).post('/api/v1/buyer-requests/'+id+'/claim').set('Authorization','Bearer '+token(other,'SELLER')).send({token:secret}).expect(403);
  const owner=await request(app.getHttpServer()).get('/api/v1/buyer-requests/'+id+'/owned').set('Authorization','Bearer '+token(buyer,'BUYER')).expect(200);
  expect(owner.body.data.owned).toBe(true);expect(owner.body.data.offers).toEqual([]);
  await request(app.getHttpServer()).post('/api/v1/buyer-requests/'+id+'/owned/close').set('Authorization','Bearer '+token(buyer,'BUYER')).send({}).expect(201);
 });
 it('seçimləri hesabda saxlayır, təkrarı və başqa hesabın oxumasını bloklayır',async()=>{
  const product=await prisma.product.create({data:{storeId:store,slug:run+'-product',title:'Test məhsulu',status:'ACTIVE'}});
  const patch=(changes:unknown)=>request(app.getHttpServer()).patch('/api/v1/library').set('Authorization','Bearer '+token(buyer,'BUYER')).send({changes});
  const changes=[{kind:'product',id:product.id,saved:true},{kind:'store',id:store,saved:true}];
  await patch(changes).expect(200);await patch(changes).expect(200);
  expect(await prisma.favorite.count({where:{userId:buyer}})).toBe(2);
  const mine=await request(app.getHttpServer()).get('/api/v1/library').set('Authorization','Bearer '+token(buyer,'BUYER')).expect(200);
  expect(mine.body.data.products[0].id).toBe(product.id);
  const foreign=await request(app.getHttpServer()).get('/api/v1/library').set('Authorization','Bearer '+token(other,'SELLER')).expect(200);
  expect(foreign.body.data.products).toEqual([]);await request(app.getHttpServer()).get('/api/v1/library').expect(401);
  await patch([{kind:'product',id:product.id,saved:'false'}]).expect(400);
  await patch([{kind:'product',id:product.id,saved:false}]).expect(200);
  expect(await prisma.favorite.count({where:{userId:buyer,kind:'product'}})).toBe(0);
  await prisma.store.update({where:{id:store},data:{status:'SUSPENDED'}});
  const hidden=await request(app.getHttpServer()).get('/api/v1/library').set('Authorization','Bearer '+token(buyer,'BUYER')).expect(200);expect(hidden.body.data.stores).toEqual([]);
  await prisma.store.update({where:{id:store},data:{status:'ACTIVE'}});
 });
 it('məhsul şikayətini moderasiyaya verir, səhv hədəfi və boş izahı rədd edir',async()=>{
  const product=await prisma.product.findFirstOrThrow({where:{storeId:store}});
  const dto={kind:'product',targetId:product.id,reason:'wrong_information',message:'Qiymət məlumatı səhv göstərilib.'};
  const result=await request(app.getHttpServer()).post('/api/v1/support/reports').send(dto).expect(201);
  expect((await prisma.report.findUnique({where:{id:result.body.data.id}}))?.productId).toBe(product.id);
  await request(app.getHttpServer()).post('/api/v1/support/reports').send({...dto,targetId:'missing'}).expect(404);
  await request(app.getHttpServer()).post('/api/v1/support/reports').send({...dto,message:' '.repeat(20)}).expect(400);
 });
 it('100 seçim limitində yeni seçimi saxlayır və eyni ID üçün son niyyəti tətbiq edir',async()=>{
  const products=Array.from({length:101},(_,i)=>({id:run+'-favorite-'+i,storeId:store,slug:run+'-favorite-'+i,title:'Test '+i,status:'ACTIVE' as const}));
  await prisma.product.createMany({data:products});
  const lastProduct=products.at(-1);
  if (!lastProduct) throw new Error('Test məhsulu yaradılmadı.');
  const patch=(changes:unknown)=>request(app.getHttpServer()).patch('/api/v1/library').set('Authorization','Bearer '+token(buyer,'BUYER')).send({changes});
  await patch(products.slice(0,100).map(p=>({kind:'product',id:p.id,saved:true}))).expect(200);
  const response=await patch([{kind:'product',id:lastProduct.id,saved:true}]).expect(200);
  expect(response.body.data.products).toHaveLength(100);expect(response.body.data.products.some((p:{id:string})=>p.id===lastProduct.id)).toBe(true);
  await patch([{kind:'product',id:lastProduct.id,saved:true},{kind:'product',id:lastProduct.id,saved:false}]).expect(200);
  expect(await prisma.favorite.findUnique({where:{userId_kind_targetId:{userId:buyer,kind:'product',targetId:lastProduct.id}}})).toBeNull();
 });
 it('mail ayarı olmadan uğur iddia etmir və bilinməyən hesabı açıqlamır',async()=>{
  const config=app.get(ConfigService);config.set('RESEND_API_KEY','');config.set('MAIL_FROM','');
  await request(app.getHttpServer()).post('/api/v1/auth/forgot-password').send({email:run+'buyer@sample.az'}).expect(503);
  config.set('RESEND_API_KEY','mock-key');config.set('MAIL_FROM','test@sample.az');
  vi.stubGlobal('fetch',vi.fn(async(_url:string,options:{body:string})=>{const body=JSON.parse(options.body);code=body.text.match(/\d{6}/)[0];return {ok:true};}));
  const unknown=await request(app.getHttpServer()).post('/api/v1/auth/forgot-password').send({email:'missing@sample.az'}).expect(200);
  const known=await request(app.getHttpServer()).post('/api/v1/auth/forgot-password').send({email:run+'buyer@sample.az'}).expect(200);
  expect(unknown.body).toEqual(known.body);expect(code).toMatch(/^\d{6}$/);
 });
 it('uğursuz cəhdləri və bir dəfəlik kodu bazada qoruyur',async()=>{
  const email=run+'buyer@sample.az';
  const login=await request(app.getHttpServer()).post('/api/v1/auth/mobile/login').send({identifier:email,password:'BeforePassword9'}).expect(200);access=login.body.data.accessToken;
  for(let i=0;i<5;i++)await request(app.getHttpServer()).post('/api/v1/auth/reset-password').send({email,code:'000000',password:'AfterPassword9'}).expect(400);
  await request(app.getHttpServer()).post('/api/v1/auth/reset-password').send({email,code,password:'AfterPassword9'}).expect(400);
  await prisma.passwordResetChallenge.updateMany({where:{userId:buyer},data:{createdAt:new Date(Date.now()-120000)}});
  await request(app.getHttpServer()).post('/api/v1/auth/forgot-password').send({email}).expect(200);
  const reset=()=>request(app.getHttpServer()).post('/api/v1/auth/reset-password').send({email,code,password:'AfterPassword9'});
  const results=await Promise.all([reset(),reset()]);expect(results.map(r=>r.status).sort()).toEqual([200,400]);
  await request(app.getHttpServer()).post('/api/v1/auth/mobile/refresh').send({refreshToken:login.body.data.refreshToken}).expect(401);
  await request(app.getHttpServer()).post('/api/v1/auth/mobile/login').send({identifier:email,password:'AfterPassword9'}).expect(200);
 });
 it('push qeydiyyatını, ünvan səhvlərini, çatdırılma qəbzini və çıxış təmizlənməsini yoxlayır',async()=>{
  const config=app.get(ConfigService);config.set('PUSH_ENABLED','true');
  const pushToken='ExpoPushToken[test_device_123456]';
  await request(app.getHttpServer()).post('/api/v1/notifications/push/register').set('Authorization','Bearer '+access).send({token:pushToken,platform:'android'}).expect(201);
  await app.get(NotificationsService).createForUsers([buyer],{title:'Sınaq yeniliyi',message:'Sınaq məlumatı',href:'/account'});
  vi.stubGlobal('fetch',vi.fn(async(url:string)=>({ok:true,json:async()=>({data:url.endsWith('getReceipts')?{'receipt-1':{status:'ok'}}:{status:'ok',id:'receipt-1'}})})));
  await app.get(PushService).flush();
  expect((await prisma.pushDelivery.findFirst({where:{userId:buyer}}))?.status).toBe('RECEIPT');
  await prisma.pushDelivery.updateMany({where:{userId:buyer},data:{nextAttemptAt:new Date(0)}});
  await app.get(PushService).flush();expect((await prisma.pushDelivery.findFirst({where:{userId:buyer}}))?.status).toBe('DELIVERED');
  await app.get(NotificationsService).createForUsers([buyer],{title:'Etibarsız cihaz',message:'Sınaq məlumatı'});
  vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>({data:{status:'error',details:{error:'DeviceNotRegistered'}}})})));
  await app.get(PushService).flush();expect(await prisma.pushDevice.count({where:{userId:buyer}})).toBe(0);
  const login=await request(app.getHttpServer()).post('/api/v1/auth/mobile/login').send({identifier:run+'buyer@sample.az',password:'AfterPassword9'}).expect(200);
  await request(app.getHttpServer()).post('/api/v1/notifications/push/register').set('Authorization','Bearer '+login.body.data.accessToken).send({token:pushToken,platform:'android'}).expect(201);
  await request(app.getHttpServer()).post('/api/v1/auth/mobile/logout').send({refreshToken:login.body.data.refreshToken,pushToken}).expect(200);
  expect(await prisma.pushDevice.count({where:{userId:buyer}})).toBe(0);
 });
})
