# Mobil tətbiq üçün kontekst paketi (MOBILE HANDOFF)

**Bu sənəd kim üçündür:** TopdanBazar-ın mobil versiyası (PWA və ya React Native/Expo tətbiqi) üzərində
işləyəcək AI agent və developerlər. Repo-dan kənar (ayrı workspace/repo) işləyirsənsə, bu sənəd +
`docs/API_CONTRACTS.md` + `apps/api/prisma/schema.prisma` + `packages/shared/src/*` kifayət edir.

**Ən vacib qayda:** Layihə haqqında heç nə "yaddaşdan/yazıdan" izah etmə. Fakt mənbəyi həmişə fayldır.
Şübhə varsa: `apps/api/src/modules/**/*.controller.ts` (endpoint-lər), `packages/shared/src/*` (tiplər),
`http://localhost:4000/api/docs` (canlı Swagger).

---

## 1. Məhsul nədir

TopdanBazar (topdanci.az) — **B2B topdansatış lead-generation marketplace**-dir. Azərbaycan bazarı,
bütün interfeys **yalnız Azərbaycan dilində**.

- **Sifariş, səbət, ödəniş, çatdırılma YOXDUR.** Alıcı satıcı ilə WhatsApp və ya telefon vasitəsilə əlaqə saxlayır.
- Platforma bu müraciətləri **lead** kimi ölçür və satıcıya göstərir (analitika, bildiriş, moderasiya).
- Satıcı mağaza açmaq üçün müraciət edir (`POST /api/v1/stores/applications`), admin təsdiqləyir, satıcıya
  birdəfəlik quraşdırma (setup) keçidi verilir və o, şifrə yaradır.

### Terminlər lüğəti (kod-da bu adlarla keçir)

| Termin | Mənası |
| --- | --- |
| `store` | Satıcı mağazası (status: PENDING / ACTIVE / SUSPENDED / REJECTED) |
| `product` | Mağazanın topdansatış elanı (status: DRAFT / PENDING_REVIEW / ACTIVE / PASSIVE / REJECTED / DELETED) |
| `category` | Kateqoriya ağacı (silinmir, statusla passiv edilir) |
| `lead` / `LeadEvent` | Alıcının əlaqə hərəkəti: `PRODUCT_VIEW`, `STORE_VIEW`, `WHATSAPP_CLICK`, `PHONE_REVEAL` |
| `store application` | Yeni mağaza müraciəti (admin moderasiyası) |
| `media` | Məhsul/mağaza şəkli (S3-yə presigned yükləmə, sonra `READY` statusu) |
| `report` | Şikayət (`type` sərbəst string-dir: `SUPPORT_REQUEST`, `SUSPICIOUS_PRODUCT`) |
| `notification` | İstifadəçi üçün daxili bildiriş (in-app; push hazırda YOXDUR) |

---

## 2. Texnologiya xəritəsi (dəyişməz faktlar)

| Qat | Texnologiya | Versiya / detal |
| --- | --- | --- |
| Web | Next.js (App Router), React, TypeScript | next `15.5.25`, react `19`, custom CSS (**Tailwind YOXDUR**) |
| API | NestJS + Prisma | NestJS `11`, Prisma `6`, global prefix `api`, URI versioning → **`/api/v1/...`** |
| DB | PostgreSQL | Prisma modelləri: User, Store, StoreMember, StoreApplication, Product, ProductImage, Category, LeadEvent, Report, ReviewSession/RefreshSession, Notification, AccountSetupToken, AuditLog |
| Cache/Queue | Redis + BullMQ | media worker, fon işləri |
| Fayl saxlama | S3 (+ CDN) | presigned PUT yükləmə, `sharp` ilə emal |
| Auth | JWT access + refresh | web-də **httpOnly cookie**, API həm də **`Authorization: Bearer`** qəbul edir |
| Ortaq kod | `packages/shared` | `USER_ROLES`, `USER_STATUSES`, `STORE_STATUSES`, `STORE_ROLES`, `PRODUCT_STATUSES`, `PRICE_TYPES`, `PRODUCT_UNITS`, `LEAD_TYPES`, pagination, `defaultCategories` |
| Test/CI | vitest + API e2e + GitHub Actions | `.github/workflows/ci.yml`, `npm run verify` |
| Web hosting | Vercel | `docs/OPERATIONS_RUNBOOK.md` |

**Node tələbi:** `>=20.11.0`, npm `>=10`.

### Vacib env açarları

| Dəyişən | Nə edir |
| --- | --- |
| `NEXT_PUBLIC_ENABLE_LIVE_CATALOG` | `false` (default) → public kataloq **demo fallback** data ilə göstərilir; `true` → real API datası |
| `NEXT_PUBLIC_ENABLE_DEMO_FALLBACK` | Demo data fallback-inin tam söndürülməsi |
| `NEXT_PUBLIC_CDN_BASE_URL` | CDN host-u `next/image` üçün avtomatik icazəli edir |
| `WEB_ORIGIN` | API-nin CORS icazə verdiyi web mənbələri (vergüllə) |
| `API_BODY_LIMIT` | JSON body limiti (default `256kb`) |
| `SMOKE_*` | `scripts/production-smoke.cjs` üçün production yoxlama açarları |

---

## 3. API səthi (koddan təsdiqlənmiş, bu siyahıdan kənara çıxma)

### Cavab və xəta formatı

```json
// uğurlu cavab
{ "data": {}, "meta": {}, "requestId": "req_..." }
// xəta
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] }, "requestId": "req_..." }
```

### Public (auth tələb etmir, `@Public()`)

| Metod | Yol | Nə verir |
| --- | --- | --- |
| GET | `/api/v1/products` | Elan siyahısı (səhifələnmiş, filtr/sort query-ləri) |
| GET | `/api/v1/products/:slug` | Elan detalı |
| GET | `/api/v1/stores` | Mağaza siyahısı |
| GET | `/api/v1/stores/:slug` | Mağaza detalı |
| POST | `/api/v1/stores/applications` | Yeni mağaza açma müraciəti |
| GET | `/api/v1/categories` | Kateqoriya ağacı |
| GET | `/api/v1/categories/:slug` | Kateqoriya detalı |
| GET | `/api/v1/search` | Axtarış |
| GET | `/api/v1/search/suggestions` | Axtarış təklifləri (typeahead) |
| POST | `/api/v1/leads` | **Lead qeydiyyatı** (bax: bölmə 5) |
| POST | `/api/v1/support/requests` | Dəstək/əlaqə müraciəti |
| GET | `/api/v1/health`, `/api/v1/health/ready`, `/api/v1/health/metrics` | Sağlamlıq/metrics |

### Auth (`/api/v1/auth/*`)

| Metod | Yol | Qeyd |
| --- | --- | --- |
| POST | `/auth/login` | Body: `{ identifier, password, rememberMe }` — **`identifier`**, `email` deyil! |
| POST | `/auth/refresh` | Refresh token rotasiyası (`RefreshSession` modeli) |
| POST | `/auth/logout`, `/auth/logout-all` | Sessiyaların bağlanması |
| GET | `/auth/session` | Cari sessiya/istifadəçi |
| PATCH | `/auth/me` | Profil yenilənməsi |
| POST | `/auth/change-password` | Şifrə dəyişmə |
| POST | `/auth/setup-password` | Satıcının setup keçidi ilə şifrə yaratması |

**Tətbiq üçün auth modeli:** `Authorization: Bearer <accessToken>`. Guard (`apps/api/src/common/guards/jwt-auth.guard.ts`)
həm cookie, həm Bearer qəbul edir → mobil tətbiq cookie-siz işləyə bilər.
Diqqət: web cookie axınında admin yazma əməliyyatları üçün `x-csrf-token` header istifadə olunur
(bax: `apps/api/src/app.e2e-spec.ts`). Bearer axınında bu tələbin olub-olmadığını canlı API-də yoxla.

### Satıcı paneli (`/api/v1/seller/*`, rol: SELLER)

`GET overview` · `GET stores` · `GET stores/:id` · `PATCH stores/:id` · `GET analytics` · `GET leads` ·
`GET products` · `GET products/:id` · `POST products` · `PATCH products/:id` ·
`POST products/:id/submit-review` · `DELETE products/:id`

### Bildirişlər (`/api/v1/notifications/*`)

`GET /` · `PATCH /:id/read` · `POST /read-all` — **yalnız in-app**; push (FCM/APNs) hələ yoxdur.

### Admin (`/api/v1/admin/*`, rol: ADMIN / SUPER_ADMIN)

Təsdiqlənmiş nümunələr: `/admin/products/:id/approve|reject|suspend`, `/admin/stores/:id/suspend|reactivate`,
`/admin/categories/:id/reactivate`, `/admin/store-applications/:id/approve|reject`.
Tam siyahı üçün mənbə: canlı Swagger (`/api/docs`) və ya `apps/web/src/lib/admin-api.ts`.
**Mobil tətbiqdə admin paneli qurmaq ehtiyacı yoxdur** — bu, web-in işidir.

### Media yükləmə

Mənbə: `apps/api/src/modules/media/media.controller.ts` + `media.service.ts`.
Axın: (1) tətbiq media qeydi yaradır → (2) API **S3 presigned PUT** URL qaytarır → (3) fayl birbaşa S3-ə gedir →
(4) worker `sharp` ilə emal edir → (5) status `READY` olur və `cdnUrl` gəlir.
Tətbiq yalnız `READY` + `cdnUrl` olan şəkli göstərməlidir.

---

## 4. Lead-lər — məhsulun pul qazandığı axın

Web tərəfdə lead-lər necə yazılır (könüllü olaraq eyni davranışı təkrarla):

- `apps/web/src/lib/lead-tracking.ts` — `POST /api/v1/leads` çağırışı
- `apps/web/src/components/lead-actions.tsx` — WhatsApp keçidi, telefon açma, təkrar saymamanın qarşısı (localStorage)

Lead növləri (`LeadEvent.type`): `PRODUCT_VIEW`, `STORE_VIEW`, `WHATSAPP_CLICK`, `PHONE_REVEAL`.

**Qayda:** mobil tətbiqdə WhatsApp/telefon düymələri də **mütləq** lead yazmalıdır, əks halda satıcının
analitikası yanlış olur. Tətbiqdən gələn lead-lər eyni satıcı panelində və admin analitikasında görünür —
ayrı məlumat bazası YARATMA.

