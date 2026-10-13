-- Adds a "which kind of admin" field on top of the existing is_admin
-- boolean, so the dashboard can tell a full Admin apart from a Moderator
-- (who can act on listings/need requests but not touch the catalog, users,
-- or other people's roles - see RolesGuard / @Roles()).
--
-- A plain TEXT column, not a native enum, matching every other status-like
-- column in this schema (listings.status, need_requests.status, ...) -
-- validated in the DTO layer instead (see admin/admin.constants.ts).
ALTER TABLE "users" ADD COLUMN "role" TEXT;

-- Backfill: every account that was already an admin becomes the full
-- Admin role - nobody loses access as a result of this migration. Nobody
-- is automatically made a Moderator; that's assigned by hand afterward
-- from the new Users page (Admin Dashboard -> Users -> change role).
UPDATE "users" SET "role" = 'ADMIN' WHERE "is_admin" = true;
