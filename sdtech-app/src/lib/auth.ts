// Shared admin token used by web (cookie) and mobile app (Bearer header).
// Change this to your own secret and redeploy.
export const ADMIN_TOKEN = "Kumar@123";

/**
 * Checks the Authorization: Bearer <token> header for API routes (mobile app).
 * Returns true if the token is valid.
 */
export function isApiAuthorized(request: Request): boolean {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return token === ADMIN_TOKEN;
}
