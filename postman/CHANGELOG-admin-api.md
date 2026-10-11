# Piqnex Admin API - Postman Collection Changelog

This file tracks every change made to `Piqnex-Admin-API.postman_collection.json`
(the Admin Dashboard's own API: its dedicated login, moderation, user/role
management, and catalog management). The regular, end-user-facing API has
its own collection and its own changelog now - see
`Piqnex-User-API.postman_collection.json` and `CHANGELOG-user-api.md`.

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
