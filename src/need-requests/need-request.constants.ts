export const NEED_REQUEST_STATUSES = ['open', 'matched', 'closed'] as const;
export type NeedRequestStatus = (typeof NEED_REQUEST_STATUSES)[number];
