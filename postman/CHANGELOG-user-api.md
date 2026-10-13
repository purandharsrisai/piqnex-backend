# Piqnex User API - Postman Collection Changelog

This file tracks every change made to `Piqnex-User-API.postman_collection.json`
(signup/login, listings, need requests, contact, profile, uploads - the
regular, end-user-facing API). Admin endpoints have their own collection
and their own changelog now - see `Piqnex-Admin-API.postman_collection.json`
and `CHANGELOG-admin-api.md`.

---

## Version 1.3.0 — 2026-10-17, 09:00 UTC

**Changes made:**
Nothing changed on existing requests. Sending a chat message (`POST /conversations/:id/messages` and `POST /listings/:id/contact`) now also sends a push notification to the other person's registered phones (fire-and-forget; it never affects the response).

**Newly added:**
"Register push token" in the Profile folder (`POST /profile/me/push-token`, login required): body `{ token, platform }` where `platform` is `ios` or `android`. Saves the device's Expo push token for the current user (new `push_tokens` table, migration `20261017000000_add_push_tokens`).

---

## Version 1.2.0 — 2026-10-13, 09:00 UTC

**Changes made:**
"Update my profile" now accepts two more optional fields: `bio` (up to 200 characters, empty string clears it) and `avatarUrl` (a small JPEG data URL or an https link; empty string removes the photo). Updated the example body and description. "Get my profile" now also returns `bio`.

**Newly added:**
New "Support" folder with "Send a Contact Us message" (`POST /support/contact`, no login needed): saves the message and emails it to the support inbox. Limited to 5 per 10 minutes per sender.

---

## Version 1.1.1 — 2026-10-11, 06:45 UTC

**Changes made:**
"Update my profile": `phone` (still optional) must now be exactly 10 digits with no country code if it is sent - anything else gets a 400 "Enter a 10-digit phone number". Updated the request's example body and description to match, so signup and profile use the same rule.

**Newly added:**
Nothing new.

---

## Version 1.1.0 — 2026-10-11, 06:30 UTC

**Changes made:**
The "Sign up" request now requires `phone` to be exactly 10 digits with no country code (anything else gets a 400 "Enter a 10-digit phone number"). The `testPhone` collection variable default changed from `+91 9876543210` to `9876543210`, and the request description was updated to match. Phone on "Update my profile" is unchanged (still optional and loosely validated).

**Newly added:**
Nothing new.

---

## Version 1.0.0 — 2026-10-03, 15:42 UTC

**Changes made:**
Split out of the single combined `Piqnex.postman_collection.json` (retired - was at version 1.7.0), so the user-facing and admin APIs can be versioned and maintained independently going forward. Nothing about the requests themselves changed in this split - every Health/Auth/Catalog/Listings/Contact/Need Requests/Profile/Uploads request, its body, its test scripts, and the collection variables they rely on were carried over exactly as they were. The full history of this content before the split (signup, login, forgot/reset password, phone number, confirm password, etc.) lives in the old `CHANGELOG.md`, kept in this folder for reference.

**Newly added:**
Nothing new - this version is the pre-split content, just under its own collection and its own version number.
