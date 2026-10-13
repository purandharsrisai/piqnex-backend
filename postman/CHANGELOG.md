# Postman Collection Changelog (retired)

**This collection was split on 2026-10-03 into two independently maintained collections:** `Piqnex-User-API.postman_collection.json` (changelog: `CHANGELOG-user-api.md`) and `Piqnex-Admin-API.postman_collection.json` (changelog: `CHANGELOG-admin-api.md`). `Piqnex.postman_collection.json` itself has been removed - import the two files above instead. Everything below this point is kept only as a historical record of the combined collection's changes up to v1.7.0, the version it was at right before the split.

---

## Version 1.7.0 — 2026-10-03, 13:01 UTC

**Changes made:**
Updated the Admin folder's description to explain the new two-role system: every request still needs is_admin = true, but ADMIN can do everything in the folder while MODERATOR is limited to the Listings and Need Requests requests - 'All users', 'Set user role', and every Categories/Brands request now return 403 for a Moderator.

**Newly added:**
A new "Set user role" request, right after "All users" in the Admin folder (`PATCH /admin/users/:userId/role`). Admin-only. Body is `{ "role": "ADMIN" | "MODERATOR" | "NONE" }` - 'NONE' revokes admin access entirely. An admin can't change their own role (prevents accidentally locking yourself out), so :userId needs to be a DIFFERENT user's id, copied from "All users"'s response.

---

## Version 1.6.0 — 2026-10-03, 12:28 UTC

**Changes made:**
Updated the Admin folder's description to point at the new "Admin Login" request as the way to get an admin-scoped accessToken, instead of re-running the regular "Log in" request in the Auth folder.

**Newly added:**
A new "Admin Login" request, first in the Admin folder (`POST /admin/auth/login`). This is for the new, separate Admin Dashboard app (piqnex-admin) - it's a dedicated login endpoint, completely independent of `POST /auth/login`, backed by its own service on the backend. It rejects a non-admin account with the same generic "Invalid email or password" error used for a wrong password, so it never reveals which accounts exist or which ones are admins. Like "Log in", its test script automatically saves the returned accessToken/userId, so the rest of the Admin folder keeps working right after you run it.

---

## Version 1.5.0 — 2026-10-03, 11:57 UTC

**Changes made:**
The "Sign up" request's description now says phone is REQUIRED at signup, not optional (the request body itself doesn't need to change - it already included a `phone` field as of v1.4.0). Leaving `phone` out of the body now gets a 400 instead of succeeding.

**Newly added:**
Nothing new was added as a separate request - this follows the Phone Number field on the sign-up form being changed from optional to mandatory.

---

## Version 1.4.0 — 2026-10-03, 11:49 UTC

**Changes made:**
Added a `testPhone` collection variable (default `+91 9876543210`, sitting right after `testEmail`). Updated the "Sign up" request: its example body now includes a `phone` field, and its description explains that phone is optional at signup and can be left out, added, or changed later from Profile.

**Newly added:**
Nothing new was added as a separate request — this follows the new Phone Number field added to the sign-up form itself (previously phone could only be added afterwards from the profile page).

---

## Version 1.3.0 — 2026-10-03, 11:29 UTC

**Changes made:**
Added two new collection variables: `resetToken` (holds the token between the two new requests below) and it sits right after `testNewPassword`.

**Newly added:**
Two new requests in the Auth folder, for the new "Forgot password" feature (for a user who is logged out and can't remember their password - different from "Change password", which needs to already be logged in):
- **Forgot password** (`POST /auth/forgot-password`) — starts a reset using just the account's email. TEMPORARY: since there's no email sending set up in this project yet, the reset token is returned directly in the response (as `resetToken`) instead of being emailed, and the test script saves it automatically. Once real email sending is added later, this response will stop including the token.
- **Reset password** (`POST /auth/reset-password`) — finishes the reset using the saved `{{resetToken}}` and a new password. The token can only be used once and expires after 1 hour. Its test script swaps `testPassword`/`testNewPassword` the same way "Change password" does, so you can re-run the collection repeatedly.

---

## Version 1.2.0 — 2026-10-03, 11:21 UTC

**Changes made:**
Added a `testNewPassword` collection variable (default `newpassword456`, sitting right next to `testPassword`).

**Newly added:**
A new "Change password" request in the Auth folder (`PATCH /auth/change-password`), for the new Change Password feature. It needs the user's current password as well as a new one, and returns an error if the current password is wrong or if the new password is the same as the old one. Its test script automatically swaps `testPassword` and `testNewPassword` after a successful change, so you can re-run it (or the whole collection) repeatedly without the saved login details going stale.

Note: this is only for a signed-in user changing their own password. A "forgot password" flow for someone who isn't signed in (emailing them a reset link) hasn't been built yet - that's planned as a separate piece of work later.

---

## Version 1.1.0 — 2026-10-03, 10:51 UTC

**Changes made:**
The "Update my profile" request (in the Profile folder) was updated to support the new phone number field that was added to user profiles. Its example request body now includes a `phone` field, and its description was updated to explain that phone is optional and only loosely checked (it accepts digits, spaces, `+`, parentheses, and dashes, and must be 6-20 characters long).

**Newly added:**
Nothing new was added as a separate request — this was an update to an existing request.

---

## Version 1.0.0 — 2026-10-03, 10:16 UTC

**Changes made:**
First version of the collection, created to let the Piqnex backend's APIs be tested manually in Postman.

**Newly added:**
Everything — this was the initial creation. The collection was set up with:
- Collection-level settings: a `baseUrl` variable pointing at `http://localhost:4000`, and automatic Bearer token authentication using a saved `accessToken` so most requests don't need any manual setup.
- Helper variables that get filled in automatically as you use the collection: `testEmail`, `testPassword`, `accessToken`, `accessToken_isAdmin`, `userId`, `listingId`, `needRequestId`, `categoryId`, `categorySlug`, `brandId`.
- Nine folders covering the whole backend:
  - **Health** — checking that the server is up.
  - **Auth** — sign up and log in (these automatically save your access token and user ID after a successful request).
  - **Catalog** — browsing and managing categories and brands.
  - **Listings** — creating, browsing, and managing marketplace listings.
  - **Contact** — contacting a seller about a listing.
  - **Need Requests** — posting and browsing "I need this" requests.
  - **Profile** — viewing and updating your own profile, plus seeing your own listings and need requests.
  - **Uploads** — uploading images.
  - **Admin** — admin-only actions, with instructions in the folder description on how to make your test account an admin (via a one-time manual database update, then logging in again).
- Requests that create something new (signing up, creating a listing, a need request, a category, or a brand) automatically save the new item's ID so later requests in the collection can reuse it without you having to copy and paste anything.
