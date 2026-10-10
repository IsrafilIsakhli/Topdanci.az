# AGENTS.md — TopdanBazar (topdanci.az)

Bu fayl repoda işləyən **bütün AI agentləri** (Codex, Cline və s.) üçün qısa, məcburi kontekstdir.
Ətraflı məlumat: `docs/` qovluğu.
Mobil tətbiq üzərində işləyirsənsə, əvvəlcə `docs/MOBILE_HANDOFF.md`-i oxu.

## Layihə nədir (bir abzasda)

B2B **topdansatış lead-generation** marketplace (Azərbaycan bazarı, yalnız Azərbaycan dili).
Sifariş, səbət, ödəniş, çatdırılma **YOXDUR**: alıcı satıcıya WhatsApp/telefonla müraciət edir və bu
müraciət "lead" kimi ölçülür (PRODUCT_VIEW, STORE_VIEW, WHATSAPP_CLICK, PHONE_REVEAL).

## Monorepo xəritəsi

| Yol | Nə var | Texnologiya |
| --- | --- | --- |
| `apps/web` | Public kataloq + satıcı paneli + admin paneli | Next.js 15.5 (App Router), React 19, TypeScript, **custom CSS** |
| `apps/api` | REST API, moderasiya, media, lead-lər, bildirişlər | NestJS 11, Prisma 6, PostgreSQL, Redis, BullMQ, S3 |
| `packages/shared` | Ortaq tiplər/enumlar (`USER_ROLES`, `STORE_STATUSES`, `PRODUCT_STATUSES`, `LEAD_TYPES`, `PRICE_TYPES`, `PRODUCT_UNITS`, pagination, `defaultCategories`) | TypeScript |
| `packages/config`, `packages/ui` | Konfiq və ümumi UI köməkçiləri | TypeScript |
| `docs/` | Arxitektura, API kontraktları, DB sxemi, runbook | Markdown |

Default branch: `main`. Web hosting: Vercel. API: konteyner (Docker) + AWS (S3/CDN).

## Dəyişməz qaydalar (pozulmaz)

1. **Bütün istifadəçi mətnləri Azərbaycan dilindədir.** İngilis dilində UI mətni (düymə, başlıq, placeholder, xəta mesajı) əlavə etmək qadağandır.
2. **API kontraktı donmuşdur:** `/api/v1`. Breaking change etmə; ehtiyac olsa ayrıca plan/versiya təklif et.
3. `apps/web`-ə **Tailwind, styled-components, i18n kitabxanası** əlavə etmə. Mövcud custom CSS sistemi var: `apps/web/src/styles/globals/*` (import sırası CSS kaskadını təyin edir).
4. **Endpoint uydurma.** Yalnız `apps/api/src/modules/**/*.controller.ts` faylları və ya canlı Swagger (`http://localhost:4000/api/docs`) təsdiq mənbəyidir.
5. **Sirr saxlamayan faylları repoya salma:** `.env*`, keystore, APNs açarı, mağaza credential-ları.
6. Dəyişiklikdən sonra mütləq işlət: `npm run typecheck` və `npm run lint`; web dəyişdisə `npm run build:web`.
7. Sənədlər: mövcud `docs/*.md` faylları ingilis dilindədir və belə qalır. Yeni sənədlər və kod şərhləri Azərbaycan dilində yazılır; kod identifikatorları və API adları ingilis dilindədir.

## Tez-tez istifadə olunan əmrlər

```bash
npm run dev:web              # Next.js → http://localhost:3000
npm run dev:api              # NestJS → http://localhost:4000 (Swagger: /api/docs)
npm run check:local-services # Postgres/Redis/Docker vəziyyəti
npm run typecheck            # bütün workspace-lər
npm run lint                 # eslint (root)
npm run build:web            # production build
npm run verify               # lint + prisma + typecheck + test + e2e + build + audit-gate
npm run prisma:migrate       # DB miqrasiyası (schema dəyişdisə)
```

## Dərin sənədlər

- `docs/ARCHITECTURE.md` — ümumi arxitektura, modul sərhədləri
- `docs/API_CONTRACTS.md` — endpoint kontraktları, cavab/xəta formatı
- `docs/DATABASE_SCHEMA.md` — Prisma modelləri
- `docs/SECURITY_BASELINE.md` — təhlükəsizlik qaydaları
- `docs/OPERATIONS_RUNBOOK.md` — deploy, smoke check, backup
- `docs/MOBILE_HANDOFF.md` — mobil tətbiq üçün kontekst paketi
