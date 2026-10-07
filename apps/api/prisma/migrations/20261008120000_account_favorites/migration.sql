CREATE TABLE "favorites" (
 "id" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "kind" TEXT NOT NULL CHECK ("kind" IN ('product', 'store')),
 "targetId" TEXT NOT NULL,
 "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "favorites_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "favorites_userId_kind_targetId_key" ON "favorites"("userId", "kind", "targetId");
CREATE INDEX "favorites_userId_updatedAt_idx" ON "favorites"("userId", "updatedAt");