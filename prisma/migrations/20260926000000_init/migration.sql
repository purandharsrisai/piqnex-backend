-- This migration mirrors prisma/schema.prisma. It was written and applied by
-- hand once (see notes in chat) because this sandbox cannot reach
-- binaries.prisma.sh to run `prisma migrate dev` itself. On your own machine,
-- once `DATABASE_URL` points at a real database, just run:
--   npx prisma migrate dev
-- Prisma will generate (and track) this same migration from schema.prisma
-- automatically - you do not need to run this file directly.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT NOT NULL DEFAULT 'New User',
    "location" TEXT,
    "avatar_url" TEXT,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

CREATE TABLE "brands" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_id" UUID,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");
CREATE INDEX "brands_category_id_idx" ON "brands"("category_id");

CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brand_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "products_brand_id_slug_key" ON "products"("brand_id", "slug");
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

CREATE TABLE "product_models" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "version_label" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "product_models_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "product_models_product_id_version_label_key" ON "product_models"("product_id", "version_label");

CREATE TABLE "parts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "model_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "parts_model_id_slug_key" ON "parts"("model_id", "slug");

CREATE TABLE "part_compatibility" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "part_id" UUID NOT NULL,
    "compatible_model_id" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "part_compatibility_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "part_compatibility_part_id_compatible_model_id_key" ON "part_compatibility"("part_id", "compatible_model_id");

CREATE TABLE "listings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seller_id" UUID NOT NULL,
    "category_id" UUID,
    "brand_id" UUID,
    "product_id" UUID,
    "model_id" UUID,
    "part_id" UUID,
    "brand_name" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "model_label" TEXT,
    "part_name" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "description" TEXT NOT NULL DEFAULT '',
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "listings_seller_id_idx" ON "listings"("seller_id");
CREATE INDEX "listings_status_idx" ON "listings"("status");
CREATE INDEX "listings_category_id_idx" ON "listings"("category_id");
CREATE INDEX "listings_created_at_idx" ON "listings"("created_at" DESC);
CREATE INDEX "listings_price_idx" ON "listings"("price");

CREATE TABLE "listing_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "storage_path" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "listing_images_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "listing_images_listing_id_idx" ON "listing_images"("listing_id");

CREATE TABLE "need_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requester_id" UUID NOT NULL,
    "category_id" UUID,
    "brand_name" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "model_label" TEXT,
    "part_name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "need_requests_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "need_requests_requester_id_idx" ON "need_requests"("requester_id");
CREATE INDEX "need_requests_status_idx" ON "need_requests"("status");

CREATE TABLE "contact_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "contact_info" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "contact_requests_listing_id_idx" ON "contact_requests"("listing_id");
CREATE INDEX "contact_requests_buyer_id_idx" ON "contact_requests"("buyer_id");

-- Foreign keys
ALTER TABLE "brands" ADD CONSTRAINT "brands_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_models" ADD CONSTRAINT "product_models_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "parts" ADD CONSTRAINT "parts_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "product_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "part_compatibility" ADD CONSTRAINT "part_compatibility_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "part_compatibility" ADD CONSTRAINT "part_compatibility_compatible_model_id_fkey" FOREIGN KEY ("compatible_model_id") REFERENCES "product_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "product_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "need_requests" ADD CONSTRAINT "need_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "need_requests" ADD CONSTRAINT "need_requests_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
