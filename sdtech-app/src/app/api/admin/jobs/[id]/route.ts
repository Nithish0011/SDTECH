import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isApiAuthorized } from "@/lib/auth";
import { jsonResponse, errorResponse, handleOptions } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleOptions();
}

// PATCH /api/admin/jobs/[id]  { is_active }  -> toggle active state
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isApiAuthorized(request)) return errorResponse("Unauthorized", 401);

  const { id } = await params;
  let body: { is_active?: number };
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body");
  }

  const newActive = body.is_active === 1 ? 1 : 0;
  const { env } = await getCloudflareContext();
  await env.DB.prepare("UPDATE jobs SET is_active = ? WHERE id = ?")
    .bind(newActive, id)
    .run();

  return jsonResponse({ success: true });
}

// DELETE /api/admin/jobs/[id]  -> delete job + its applications
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isApiAuthorized(request)) return errorResponse("Unauthorized", 401);

  const { id } = await params;
  const { env } = await getCloudflareContext();
  await env.DB.prepare("DELETE FROM applications WHERE job_id = ?").bind(id).run();
  await env.DB.prepare("DELETE FROM jobs WHERE id = ?").bind(id).run();

  return jsonResponse({ success: true });
}
