# TopdanBazar API Contracts

## 1. API Principles

The API is built for a B2B lead-generation marketplace.

No order, cart, payment, checkout, or shipping APIs should be created in the production foundation.

All list endpoints must be paginated.

All write endpoints must validate:

- Auth
- Role
- Store ownership where applicable
- DTO shape

Response format:

```json
{
  "data": {},
  "meta": {},
  "requestId": "req_..."
}
```

Error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": []
  },
  "requestId": "req_..."
}
```

## 2. Auth

### POST /auth/login

Body:

```json
{
  "identifier": "user@example.com",
  "password": "secret",
  "rememberMe": true
}
```

Returns:

```json
{
  "data": {
    "authenticated": true,
    "user": {
      "id": "...",
      "email": "user@example.com",
      "role": "SELLER"
    }
  }
}
```

Sets httpOnly `tb_access` and `tb_refresh` cookies plus readable `tb_csrf`.
Private mutations must send `x-csrf-token` with the `tb_csrf` value.

### POST /auth/logout

Invalidates session/token where applicable.

### POST /auth/logout-all

Revokes all active refresh sessions for the current user.

### POST /auth/setup-password

Completes one-time seller account setup from a hashed setup token.

### POST /auth/forgot-password

Later optional.

### POST /auth/reset-password

Later optional.

## 3. Store Application

### POST /store-applications

Public endpoint for seller applications.

Body:

```json
{
  "fullName": "Ali Mammadov",
  "email": "ali@example.com",
  "phone": "+994501234567",
  "whatsapp": "+994501234567",
  "storeName": "Baku Build & Supply MMC",
  "categoryId": "cat_...",
  "city": "Baki",
  "district": "Nerimanov",
  "description": "Wholesale construction materials"
}
```

Returns:

```json
{
  "data": {
    "id": "app_...",
    "status": "PENDING"
  }
}
```

## 4. Public Stores

### GET /stores

Query:

```txt
q
categoryId
city
verified
cursor
limit
sort
```

Returns:

```json
{
  "data": [
    {
      "id": "...",
      "name": "Baku Build & Supply MMC",
      "slug": "baku-build-supply",
      "logoUrl": "...",
      "city": "Baki",
      "category": "Insaat materiallari",
      "productCount": 1245,
      "verified": true
    }
  ],
  "meta": {
    "nextCursor": "..."
  }
}
```

### GET /stores/:slug

Returns public store profile.

### GET /stores/:slug/products

Paginated product list for one store.

## 5. Public Products

### GET /products

Query:

```txt
q
categoryId
storeId
city
minPrice
maxPrice
priceType
verifiedStore
cursor
limit
sort
```

Returns product cards.

### GET /products/:slug

Returns product detail.

### GET /products/:id/related

Returns related products.

### GET /products/:id/store-products

Returns other products from the same store.

## 6. Categories

### GET /categories

Returns category tree and counts.

### GET /categories/:slug/products

Returns products in category.

## 7. Leads

### POST /leads

Tracks lead events.

Body:

```json
{
  "storeId": "store_...",
  "productId": "product_...",
  "type": "WHATSAPP_CLICK",
  "source": "product_details"
}
```

Rules:

- Rate limited
- Does not block external redirect
- Should be fire-and-forget on frontend when safe

## 8. Seller Store Management

### GET /seller/store

Returns seller's store.

### PATCH /seller/store

Updates store profile.

Requires:

- SELLER role
- Store ownership

### GET /seller/products

Seller product list.

### POST /seller/products

Creates product draft or pending-review product.

### PATCH /seller/products/:id

Updates product.

### DELETE /seller/products/:id

Soft deletes product.

### POST /seller/products/:id/submit-review

Submits product for moderation.

## 9. Media

### POST /media/upload-url

Creates signed upload URL.

Body:

```json
{
  "productId": "product_...",
  "fileName": "image.jpg",
  "contentType": "image/jpeg",
  "sizeBytes": 123456
}
```

Rules:

- Max file size enforced
- MIME allowed list
- Short expiration

### POST /media/product-images/:id/complete

Queues uploaded image validation and optimized variant generation.

## 10. Seller Analytics

### GET /seller/analytics/summary

Returns:

- Product views
- Store views
- WhatsApp clicks
- Phone reveals

### GET /seller/leads

Paginated leads.

## 11. Admin

### GET /admin/summary

Dashboard stats.

### GET /admin/store-applications

Pending/approved/rejected seller application list.

### GET /admin/store-applications/:id

Seller application detail.

### POST /admin/store-applications/:id/approve

Creates or links seller user, creates store, creates owner membership, and returns one-time setup link.

### POST /admin/store-applications/:id/reject

Rejects seller application with review note.

### GET /admin/stores

Paginated store management list.

### GET /admin/stores/:id

Store details.

### POST /admin/stores/:id/approve

Approves store.

### POST /admin/stores/:id/reject

Rejects store with reason.

### POST /admin/stores/:id/suspend

Suspends store.

### GET /admin/products

Paginated product moderation list.

### GET /admin/products/:id

Product moderation detail.

### POST /admin/products/:id/approve

Approves product.

### POST /admin/products/:id/reject

Rejects product with reason.

### POST /admin/products/:id/suspend

Suspends product.

### GET /admin/categories

Category management.

### POST /admin/categories

Create category.

### PATCH /admin/categories/:id

Update category.

### GET /admin/leads

Lead analytics.

### GET /admin/reports

Report list.

### PATCH /admin/reports/:id

Update report status.

### GET /admin/audit-logs

Audit log list.

## 12. Additive Support Ticket API

The existing report endpoints remain unchanged. Store owners and members can
use `/seller/tickets`; only `SUPER_ADMIN` can use `/admin/tickets`.
Both prefixes support `GET /`, `GET /:id`, `GET /:id/messages`,
`POST /:id/messages`, and `PATCH /:id`. Creating tickets is supported only by
`POST /seller/tickets`. All paths are relative to `/api/v1`.

Ticket writes require the current `version`; stale writes return `409`.
Closing requires a reason in `message`. Replies to closed tickets are rejected.
Statuses are `OPEN`, `IN_PROGRESS`, `WAITING_SELLER`, `WAITING_SUPPORT`, and
`CLOSED`. Existing authentication and CSRF protections apply.
See [Ticket System](TICKET_SYSTEM.md) for request fields, pagination, role limits,
notifications, migration instructions, and isolated integration tests.

## 13. Health

### GET /health

Returns service health.

### GET /health/ready

Checks dependencies:

- Database
- Redis
- Queue

### GET /health/metrics

Returns request counters and media worker queue metrics. When `METRICS_TOKEN` is configured, callers must send `x-metrics-token`.
