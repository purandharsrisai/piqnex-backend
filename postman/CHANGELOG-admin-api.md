# Piqnex Admin API - Postman Collection Changelog

This file tracks every change made to `Piqnex-Admin-API.postman_collection.json`
(the Admin Dashboard's own API: its dedicated login, moderation, user/role
management, and catalog management). The regular, end-user-facing API has
its own collection and its own changelog now - see
`Piqnex-User-API.postman_collection.json` and `CHANGELOG-user-api.md`.

---

## Version 1.7.0 — 2026-10-20, 12:00 UTC

**Changes made:**
New request "Contact Us message details" (`GET /admin/support-messages/:id`): returns a single Contact Us message, used by the Admin Dashboard's new message details page. Open to Admins and Moderators.

---

## Version 1.6.0 — 2026-10-19, 12:00 UTC

**Changes made:**
New request "Listing details (all photos)" (`GET /admin/listings/:id`): returns one listing with its seller and every photo, used by the Admin Dashboard's new listing details page. Open to Admins and Moderators.

---

## Version 1.5.0 — 2026-10-18, 12:00 UTC

**Changes made:**
"User profile" (`GET /admin/users/:id`): each entry in `listings` (the user's 5 latest) now includes `images` with the listing's first photo (`storagePath`, `sortOrder`), so the Admin Dashboard can show listing thumbnails on the user page. No other fields changed.

---

## Version 1.4.0 — 2026-10-17, 12:00 UTC

**Changes made:**
"All listings (any status)" and "All need requests (any status)" accept a new optional `userId` query parameter that returns only that user's records (the seller of a listing / the requester of a need request). It combines with the existing `q` and `status` filters; omitting it behaves exactly as before. Used by the admin user profile's "View all" links.

**Newly added:**
Nothing new - only the optional `userId` parameter above.

---

## Version 1.3.0 — 2026-10-16, 12:00 UTC

**Changes made:**
Nothing existing changed.

**Newly added:**
"Send password reset email (admin)" (`POST /admin/users/:id/password-reset`) in Users & Roles - emails the user a standard password reset link so an admin can help a locked-out user. The link is never returned to the admin (only `{ email, delivered }`), so the admin never sees a password or a usable token. Admin-only; 404 for an unknown user.

---

## Version 1.2.0 — 2026-10-15, 12:00 UTC

**Changes made:**
"All users" now also returns each user's `status`, `phone` and `avatarUrl`. "All listings (any status)" and "All need requests (any status)" now accept optional `q` (search text) and `status` query parameters, and their `total` reflects the filtered results - both are optional, so existing calls behave exactly as before.

**Newly added:**
"User profile (admin)" (`GET /admin/users/:id`) in Users & Roles - a user's full profile, activity counts, reports filed against them, and their latest listings and need requests. "Set user status (suspend / reactivate)" (`PATCH /admin/users/:id/status`) - suspended accounts can't log in and their existing tokens stop working; you can't suspend yourself. Both are Admin-only. New collection variable `targetUserId`. Requires the new `status` column on `users` (migration `20261015000000_add_user_status`).

---

## Version 1.1.0 — 2026-10-13, 12:00 UTC

**Changes made:**
"Overview counts" now also returns `openReports` and `newSupportMessages`.

**Newly added:**
New "Reports" folder: "Reports queue" (`GET /admin/reports`, optional `status` filter) and "Set report status" (`PATCH /admin/reports/:id`) - these endpoints already existed but were not in the collection. New "Contact Us inbox" folder: "Contact Us messages" (`GET /admin/support-messages`, optional `status` filter, paged) and "Set Contact Us message status" (`PATCH /admin/support-messages/:id/status`). All four are open to Admins and Moderators. New collection variables `reportId` and `supportMessageId` (saved automatically by the list requests).

---

## Version 1.0.0 — 2026-10-03, 15:42 UTC

**Changes made:**
Split out of the single combined `Piqnex.postman_collection.json` (retired - was at version 1.7.0), so the admin and user-facing APIs can be versioned and maintained independently going forward. The flat "Admin" folder from that collection was reorganized into sub-folders here (Auth, Overview, Listings, Need Requests, Users & Roles, Catalog) for readability now that it's a collection of its own, rather than one folder among many - nothing about the requests themselves changed: every body, test script, and variable they rely on was carried over exactly as it was. The full history of this content before the split (Admin Login, roles, Set user role, etc.) lives in the old `CHANGELOG.md`, kept in this folder for reference.

**Newly added:**
Nothing new - this version is the pre-split content, reorganized into folders, under its own collection and its own version number.
