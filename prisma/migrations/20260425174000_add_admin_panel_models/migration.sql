-- Enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'LOJISTA', 'CLIENTE');
CREATE TYPE "UserStatus" AS ENUM ('ATIVO', 'INATIVO', 'BLOQUEADO', 'PENDENTE');
CREATE TYPE "StoreStatus" AS ENUM ('ATIVA', 'INATIVA', 'PENDENTE', 'BLOQUEADA');
CREATE TYPE "ProductStatus" AS ENUM ('ATIVO', 'INATIVO');
CREATE TYPE "OrderStatus" AS ENUM ('AGUARDANDO', 'EM_ANDAMENTO', 'ENTREGUE', 'CANCELADO');
CREATE TYPE "CatalogStatus" AS ENUM ('PUBLICADO', 'PAUSADO');

-- User
ALTER TABLE "User"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'CLIENTE',
ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ATIVO',
ADD COLUMN "lastLoginAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Store
ALTER TABLE "Store"
ADD COLUMN "status" "StoreStatus" NOT NULL DEFAULT 'ATIVA',
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Product
ALTER TABLE "Product"
ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'ATIVO',
ADD COLUMN "stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "category" TEXT;

UPDATE "Product" SET "status" = CASE WHEN "available" THEN 'ATIVO'::"ProductStatus" ELSE 'INATIVO'::"ProductStatus" END;

-- Order
ALTER TABLE "Order"
ADD COLUMN "customerName" TEXT NOT NULL DEFAULT 'Cliente',
ADD COLUMN "status" "OrderStatus" NOT NULL DEFAULT 'AGUARDANDO',
ADD COLUMN "deliveryAddress" TEXT;

-- Catalog
CREATE TABLE "Catalog" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "categories" TEXT[],
  "status" "CatalogStatus" NOT NULL DEFAULT 'PUBLICADO',
  "storeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Catalog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Catalog_storeId_idx" ON "Catalog"("storeId");
ALTER TABLE "Catalog" ADD CONSTRAINT "Catalog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- OrderStatusHistory
CREATE TABLE "OrderStatusHistory" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AuditLog
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "beforeData" JSONB,
  "afterData" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
