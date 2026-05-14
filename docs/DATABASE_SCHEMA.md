# TopdanBazar Database Schema

## 1. Schema Principles

The database models a B2B lead-generation marketplace, not an order platform.

Core domain:

```txt
User
  -> AccountSetupToken
  -> RefreshSession
  -> StoreMember
      -> Store
          -> Product
              -> ProductImage

Category
LeadEvent
AuditLog
Report
```

There are no order, cart, checkout, payment, or shipping tables in the production foundation.

## 2. Core Models

### User

Represents a buyer, seller, admin, or super admin.

Fields:

- id
- email
- phone
- passwordHash
- role
- status
- createdAt
- updatedAt

Indexes:

- email unique
- phone unique nullable
- role
- status

### Store

Represents a wholesale seller profile.

Fields:

- id
- name
- slug
- description
- logoUrl
- coverUrl
- phone
- whatsapp
- email
- city
- district
- address
- status
- verifiedAt
- createdAt
- updatedAt

Indexes:

- slug unique
- status
- city
- createdAt

### StoreMember

Connects users to stores with roles.

Fields:

- id
- userId
- storeId
- role
- createdAt

Constraints:

- unique userId + storeId

Roles:

- OWNER
- MANAGER
- STAFF

### Category

Supports main and subcategories.

Fields:

- id
- parentId
- name
- slug
- icon
- sortOrder
- status
- createdAt
- updatedAt

Indexes:

- slug unique
- parentId
- status
- sortOrder

### Product

Represents a public catalog item.

Fields:

- id
- storeId
- categoryId
- title
- slug
- description
- productCode
- price
- currency
- priceType
- unit
- minimumOrderQuantity
- originCountry
- status
- reviewNote
- reviewedAt
- reviewedById
- publishedAt
- viewCount
- leadCount
- createdAt
- updatedAt

Constraints:

- unique storeId + slug

Indexes:

- storeId + status
- categoryId + status
- status + createdAt
- publishedAt
- productCode

### ProductImage

Stores image metadata and generated variants.

Fields:

- id
- productId
- storageKey
- cdnUrl
- variants
- failureReason
- width
- height
- mimeType
- sizeBytes
- sortOrder
- status
- createdAt

Indexes:

- productId + sortOrder
- status

### LeadEvent

Tracks external contact and view events.

Fields:

- id
- storeId
- productId nullable
- type
- ipHash
- userAgent
- referrer
- source
- createdAt

Types:

- WHATSAPP_CLICK
- PHONE_REVEAL
- EMAIL_CLICK
- STORE_VIEW
- PRODUCT_VIEW

Indexes:

- storeId + createdAt
- productId + createdAt
- type + createdAt

This table can grow quickly. Later options:

- Monthly partitioning
- TimescaleDB
- ClickHouse
- Separate analytics pipeline

### AuditLog

Tracks admin and sensitive seller actions.

Fields:

- id
- actorId
- action
- entity
- entityId
- metadata
- ipAddress
- createdAt

Indexes:

- actorId
- entity + entityId
- createdAt

### Report

Tracks product/store complaints.

Fields:

- id
- reporterName
- reporterEmail
- storeId nullable
- productId nullable
- type
- reason
- status
- adminNote
- createdAt
- updatedAt

Indexes:

- status
- storeId
- productId
- createdAt

### AccountSetupToken

Stores one-time seller onboarding tokens as hashes only.

Fields:

- id
- userId
- tokenHash
- expiresAt
- usedAt
- createdAt

Rules:

- Raw setup token is returned only once to admin approval flow.
- DB stores only hash.
- Expired or used tokens cannot set passwords.

## 3. Enums

```txt
UserRole:
  BUYER
  SELLER
  ADMIN
  SUPER_ADMIN

UserStatus:
  ACTIVE
  SUSPENDED
  DELETED

StoreRole:
  OWNER
  MANAGER
  STAFF

StoreStatus:
  PENDING
  ACTIVE
  SUSPENDED
  REJECTED

ProductStatus:
  DRAFT
  PENDING_REVIEW
  ACTIVE
  PASSIVE
  REJECTED
  DELETED

PriceType:
  FIXED
  NEGOTIABLE

ProductUnit:
  PIECE
  BOX
  KG
  TON
  METER
  PACKAGE

LeadType:
  WHATSAPP_CLICK
  PHONE_REVEAL
  EMAIL_CLICK
  STORE_VIEW
  PRODUCT_VIEW

ReportStatus:
  OPEN
  INVESTIGATING
  RESOLVED
  REJECTED
```

## 4. Prisma Draft

```prisma
model User {
  id           String     @id @default(uuid())
  email        String     @unique
  phone        String?    @unique
  passwordHash String
  role         UserRole   @default(BUYER)
  status       UserStatus @default(ACTIVE)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  storeMembers StoreMember[]
  auditLogs    AuditLog[]

  @@index([role])
  @@index([status])
}

model Store {
  id          String      @id @default(uuid())
  name        String
  slug        String      @unique
  description String?
  logoUrl     String?
  coverUrl    String?
  phone       String?
  whatsapp    String?
  email       String?
  city        String?
  district    String?
  address     String?
  status      StoreStatus @default(PENDING)
  verifiedAt  DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  members  StoreMember[]
  products Product[]
  leads    LeadEvent[]
  reports  Report[]

  @@index([status])
  @@index([city])
  @@index([createdAt])
}

model StoreMember {
  id        String    @id @default(uuid())
  userId    String
  storeId   String
  role      StoreRole @default(OWNER)
  createdAt DateTime  @default(now())

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  store Store @relation(fields: [storeId], references: [id], onDelete: Cascade)

  @@unique([userId, storeId])
  @@index([storeId])
}

model Category {
  id        String         @id @default(uuid())
  parentId  String?
  name      String
  slug      String         @unique
  icon      String?
  sortOrder Int            @default(0)
  status    CategoryStatus @default(ACTIVE)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")
  products Product[]

  @@index([parentId])
  @@index([status])
  @@index([sortOrder])
}

model Product {
  id                   String        @id @default(uuid())
  storeId              String
  categoryId           String?
  title                String
  slug                 String
  description          String?
  productCode          String?
  price                Decimal?      @db.Decimal(12, 2)
  currency             String        @default("AZN")
  priceType            PriceType     @default(NEGOTIABLE)
  unit                 ProductUnit?
  minimumOrderQuantity Int?
  originCountry        String?
  status               ProductStatus @default(DRAFT)
  publishedAt          DateTime?
  viewCount            Int           @default(0)
  leadCount            Int           @default(0)
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt

  store    Store          @relation(fields: [storeId], references: [id], onDelete: Cascade)
  category Category?      @relation(fields: [categoryId], references: [id])
  images   ProductImage[]
  leads    LeadEvent[]
  reports  Report[]

  @@unique([storeId, slug])
  @@index([storeId, status])
  @@index([categoryId, status])
  @@index([status, createdAt])
  @@index([publishedAt])
  @@index([productCode])
}

model ProductImage {
  id           String      @id @default(uuid())
  productId    String
  originalKey  String?
  thumbnailUrl String
  mediumUrl    String
  largeUrl     String
  width        Int?
  height       Int?
  sortOrder    Int         @default(0)
  status       MediaStatus @default(READY)
  createdAt    DateTime    @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId, sortOrder])
  @@index([status])
}

model LeadEvent {
  id        String   @id @default(uuid())
  storeId   String
  productId String?
  type      LeadType
  ipHash    String?
  userAgent String?
  referrer  String?
  source    String?
  createdAt DateTime @default(now())

  store   Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  product Product? @relation(fields: [productId], references: [id], onDelete: SetNull)

  @@index([storeId, createdAt])
  @@index([productId, createdAt])
  @@index([type, createdAt])
}
```

## 5. Data Growth Risks

Highest growth tables:

- ProductImage
- LeadEvent
- AuditLog

Early mitigation:

- Keep image binary data out of DB
- Store only metadata and URLs
- Hash IPs for privacy
- Paginate admin logs
- Archive old analytics later
