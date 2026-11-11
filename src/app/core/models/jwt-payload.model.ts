export interface JwtPayload {
  exp: number;
  [claim: string]: unknown;
}
