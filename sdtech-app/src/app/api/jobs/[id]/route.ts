import { getCloudflareContext } from "@opennextjs/cloudflare";
import { jsonResponse, errorResponse, handleOptions } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleOptions();
}

// GET /api/jobs/[id]  -> single active job (public, no auth)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { env } = await getCloudflareContext();
  const job = await env.DB.prepare(
    "SELECT * FROM jobs WHERE id = ? AND is_active = 1"
  )
    .bind(id)
    .first();

  if (!job) return errorResponse("Job not found", 404);
  return jsonResponse(job);
}
