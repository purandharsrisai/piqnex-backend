/** Shape of the data encoded inside an access token. */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  isAdmin: boolean;
  // Only meaningful when isAdmin is true - 'ADMIN' | 'MODERATOR' | null.
  // Kept as a plain string here (not the AdminRole type from
  // admin/admin.constants.ts) so this file doesn't have to depend on the
  // admin module just for a type.
  role: string | null;
}
