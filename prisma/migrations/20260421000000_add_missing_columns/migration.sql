-- Add missing columns detected by schema drift (schema.prisma vs existing migrations)

-- Store: add slug (unique) and unique constraint on userId
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "slug" TEXT;
UPDATE "Store" SET "slug" = "id" WHERE "slug" IS NULL;
ALTER TABLE "Store" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Store_slug_key" ON "Store"("slug");
CREATE INDEX IF NOT EXISTS "Store_slug_idx" ON "Store"("slug");
ALTER TABLE "Store" DROP COLUMN IF EXISTS "plan";
ALTER TABLE "Store" ADD CONSTRAINT "Store_userId_key" UNIQUE ("userId");

-- Product: add image, available, createdAt, updatedAt; change price to Decimal(10,2)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "available" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Product" ALTER COLUMN "price" TYPE DECIMAL(10,2) USING "price"::DECIMAL(10,2);

-- User: remove plans/role added by add_user_plans migration (not in current schema.prisma)
ALTER TABLE "User" DROP COLUMN IF EXISTS "plans";
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";
DROP TYPE IF EXISTS "Role";
