-- CreateEnum
CREATE TYPE "BuyerRequestStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateTable
CREATE TABLE "buyer_requests" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "managementHash" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unit" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "status" "BuyerRequestStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyer_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyer_offers" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "price" DECIMAL(12,2),
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyer_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_challenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_devices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_deliveries" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "href" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "receiptId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "buyer_requests_status_createdAt_id_idx" ON "buyer_requests"("status", "createdAt", "id");

-- CreateIndex
CREATE INDEX "buyer_requests_ownerUserId_idx" ON "buyer_requests"("ownerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "buyer_offers_requestId_storeId_key" ON "buyer_offers"("requestId", "storeId");

-- CreateIndex
CREATE INDEX "password_reset_challenges_userId_usedAt_createdAt_idx" ON "password_reset_challenges"("userId", "usedAt", "createdAt");

-- CreateIndex
CREATE INDEX "password_reset_challenges_expiresAt_idx" ON "password_reset_challenges"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "push_devices_token_key" ON "push_devices"("token");

-- CreateIndex
CREATE INDEX "push_devices_userId_idx" ON "push_devices"("userId");

-- CreateIndex
CREATE INDEX "push_deliveries_status_nextAttemptAt_idx" ON "push_deliveries"("status", "nextAttemptAt");

-- AddForeignKey
ALTER TABLE "buyer_requests" ADD CONSTRAINT "buyer_requests_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_offers" ADD CONSTRAINT "buyer_offers_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "buyer_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_offers" ADD CONSTRAINT "buyer_offers_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_challenges" ADD CONSTRAINT "password_reset_challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_devices" ADD CONSTRAINT "push_devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_deliveries" ADD CONSTRAINT "push_deliveries_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "push_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
