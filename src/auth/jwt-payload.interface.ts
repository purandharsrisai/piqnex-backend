/** Shape of the data encoded inside an access token. */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  isAdmin: boolean;
}
