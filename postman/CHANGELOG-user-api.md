# Piqnex User API - Postman Collection Changelog

This file tracks every change made to `Piqnex-User-API.postman_collection.json`
(signup/login, listings, need requests, contact, profile, uploads - the
regular, end-user-facing API). Admin endpoints have their own collection
and their own changelog now - see `Piqnex-Admin-API.postman_collection.json`
and `CHANGELOG-admin-api.md`.

---

## Version 1.0.0 — 2026-10-03, 15:42 UTC

**Changes made:**
Split out of the single combined `Piqnex.postman_collection.json` (retired - was at version 1.7.0), so the user-facing and admin APIs can be versioned and maintained independently going forward. Nothing about the requests themselves changed in this split - every Health/Auth/Catalog/Listings/Contact/Need Requests/Profile/Uploads request, its body, its test scripts, and the collection variables they rely on were carried over exactly as they were. The full history of this content before the split (signup, login, forgot/reset password, phone number, confirm password, etc.) lives in the old `CHANGELOG.md`, kept in this folder for reference.

**Newly added:**
Nothing new - this version is the pre-split content, just under its own collection and its own version number.
