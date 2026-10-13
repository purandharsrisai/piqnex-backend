-- Adds an optional phone number to users. Collected from the profile page
-- after signup (see UpdateProfileDto / ProfileService.updateMe), not part
-- of the signup form itself.
ALTER TABLE "users" ADD COLUMN "phone" TEXT;
