CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_SELLER', 'WAITING_SUPPORT', 'CLOSED');
CREATE TYPE "TicketReason" AS ENUM ('TECHNICAL', 'STORE_PROFILE', 'PRODUCT_REVIEW', 'COMPLAINT', 'ACCOUNT', 'OTHER');
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "TicketMessageKind" AS ENUM ('MESSAGE', 'SYSTEM');
CREATE TABLE "support_tickets" (
  "id" TEXT NOT NULL, "number" SERIAL NOT NULL, "storeId" TEXT NOT NULL, "creatorId" TEXT, "assigneeId" TEXT,
  "subject" VARCHAR(200) NOT NULL, "reason" "TicketReason" NOT NULL,
  "priority" "TicketPriority" NOT NULL DEFAULT 'NORMAL', "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
  "version" INTEGER NOT NULL DEFAULT 1, "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ticket_messages" (
  "id" TEXT NOT NULL, "ticketId" TEXT NOT NULL, "authorId" TEXT, "authorRole" "UserRole" NOT NULL,
  "kind" "TicketMessageKind" NOT NULL DEFAULT 'MESSAGE', "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "support_tickets_number_key" ON "support_tickets"("number");
CREATE INDEX "support_tickets_storeId_status_updatedAt_idx" ON "support_tickets"("storeId", "status", "updatedAt");
CREATE INDEX "support_tickets_status_priority_updatedAt_idx" ON "support_tickets"("status", "priority", "updatedAt");
CREATE INDEX "support_tickets_assigneeId_status_idx" ON "support_tickets"("assigneeId", "status");
CREATE INDEX "ticket_messages_ticketId_createdAt_id_idx" ON "ticket_messages"("ticketId", "createdAt", "id");
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
