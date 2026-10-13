// Allowed values for listings.condition / listings.status. Enforced here in
// the DTO rather than with database check constraints.
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
