// Module-level auth token store
// Cannot use localStorage/cookies in sandboxed iframe — store in memory
let _token: string | null = null;

export function getAuthToken(): string | null {
  return _token;
}

export function setAuthToken(token: string | null): void {
  _token = token;
}
