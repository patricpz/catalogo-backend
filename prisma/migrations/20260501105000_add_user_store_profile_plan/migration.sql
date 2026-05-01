-- User profile fields
ALTER TABLE "User"
ADD COLUMN "name" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "avatar_url" TEXT;

-- Plan table
CREATE TABLE "Plan" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "max_products" INTEGER NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "features" JSONB,
  CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- Store profile fields
ALTER TABLE "Store"
ADD COLUMN "description" TEXT,
ADD COLUMN "logo_url" TEXT,
ADD COLUMN "phone_whatsapp" TEXT,
ADD COLUMN "address_logradouro" TEXT,
ADD COLUMN "address_numero" TEXT,
ADD COLUMN "address_complemento" TEXT,
ADD COLUMN "address_bairro" TEXT,
ADD COLUMN "address_cidade" TEXT,
ADD COLUMN "address_estado" TEXT,
ADD COLUMN "address_cep" TEXT,
ADD COLUMN "opening_hours" JSONB,
ADD COLUMN "is_open" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "primary_color" TEXT NOT NULL DEFAULT '#1D9E75',
ADD COLUMN "plan_id" TEXT,
ADD COLUMN "product_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "over_limit" BOOLEAN NOT NULL DEFAULT false;

-- Backfill and defaults
UPDATE "Store"
SET "phone_whatsapp" = "whatsappNumber"
WHERE "phone_whatsapp" IS NULL AND "whatsappNumber" IS NOT NULL;

INSERT INTO "Plan" ("id", "name", "max_products", "price", "features")
VALUES
  ('plan-basico', 'Básico', 10, 49.90, '{"support":"email"}'::jsonb),
  ('plan-pro', 'Pro', 50, 149.90, '{"support":"priority","analytics":true}'::jsonb)
ON CONFLICT ("id") DO NOTHING;

UPDATE "Store"
SET "plan_id" = 'plan-basico'
WHERE "plan_id" IS NULL;

ALTER TABLE "Store"
ALTER COLUMN "plan_id" SET NOT NULL;

-- Product counters and over_limit flags
UPDATE "Store" s
SET "product_count" = p.cnt
FROM (
  SELECT "storeId", COUNT(*)::integer AS cnt
  FROM "Product"
  WHERE "status" = 'ATIVO'
  GROUP BY "storeId"
) p
WHERE s."id" = p."storeId";

UPDATE "Store" s
SET "over_limit" = s."product_count" > pl."max_products"
FROM "Plan" pl
WHERE s."plan_id" = pl."id";

-- Constraints and indexes
ALTER TABLE "Store"
ADD CONSTRAINT "Store_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Store_plan_id_idx" ON "Store"("plan_id");
CREATE INDEX "Product_storeId_status_idx" ON "Product"("storeId", "status");
