export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RefreshResponse {
  access: string;
}
