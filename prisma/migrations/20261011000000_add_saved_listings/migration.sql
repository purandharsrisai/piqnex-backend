CREATE TABLE "saved_listings" (
    "user_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_listings_pkey" PRIMARY KEY ("user_id","listing_id")
);
CREATE INDEX "saved_listings_user_id_created_at_idx" ON "saved_listings"("user_id", "created_at" DESC);
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
