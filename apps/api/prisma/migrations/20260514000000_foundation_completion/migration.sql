-- Add account setup tokens for seller onboarding.
CREATE TABLE "account_setup_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_setup_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "account_setup_tokens_tokenHash_key" ON "account_setup_tokens"("tokenHash");
CREATE INDEX "account_setup_tokens_userId_usedAt_expiresAt_idx" ON "account_setup_tokens"("userId", "usedAt", "expiresAt");
CREATE INDEX "account_setup_tokens_expiresAt_idx" ON "account_setup_tokens"("expiresAt");

ALTER TABLE "account_setup_tokens"
  ADD CONSTRAINT "account_setup_tokens_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Add product moderation metadata.
ALTER TABLE "products"
  ADD COLUMN "reviewNote" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3),
  ADD COLUMN "reviewedById" TEXT;

CREATE INDEX "products_reviewedById_idx" ON "products"("reviewedById");

ALTER TABLE "products"
  ADD CONSTRAINT "products_reviewedById_fkey"
  FOREIGN KEY ("reviewedById") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Add image processing output/failure metadata.
ALTER TABLE "product_images"
  ADD COLUMN "variants" JSONB,
  ADD COLUMN "failureReason" TEXT;
