CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reviews_rating_check" CHECK ("rating" BETWEEN 1 AND 5)
);
CREATE UNIQUE INDEX "reviews_listing_id_reviewer_id_key" ON "reviews"("listing_id", "reviewer_id");
CREATE INDEX "reviews_seller_id_created_at_idx" ON "reviews"("seller_id", "created_at" DESC);
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
