// Same allowed values as the original Postgres `check` constraints on
// listings.condition / listings.status (see missing-piece-marketplace/
// supabase/migrations/0001_init_schema.sql). Enforced here in the DTO
// instead of the database.
export const LISTING_CONDITIONS = [
  'New',
  'Like New',
  'Used - Working',
  'Used - Good',
  'Used - Fair',
  'For Parts',
] as const;
export type ListingCondition = (typeof LISTING_CONDITIONS)[number];

export const LISTING_STATUSES = ['active', 'sold', 'removed'] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];
