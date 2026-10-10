import { ADMIN_TOKEN } from "@/lib/auth";
import { jsonResponse, errorResponse, handleOptions } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleOptions();
}

// POST /api/admin/login  { token }
export async function POST(request: Request) {
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body");
  }

  const token = body.token?.trim();
  if (!token) return errorResponse("Token is required");
  if (token !== ADMIN_TOKEN) return errorResponse("Invalid token", 401);

  // Token is valid — the app stores it and sends it as Bearer on future requests
  return jsonResponse({ success: true, token: ADMIN_TOKEN });
}
