import { getCloudflareContext } from "@opennextjs/cloudflare";
import { jsonResponse, handleOptions } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleOptions();
}

// GET /api/jobs  -> active jobs only (public, no auth)
export async function GET() {
  const { env } = await getCloudflareContext();
  const { results } = await env.DB.prepare(
    "SELECT * FROM jobs WHERE is_active = 1 ORDER BY created_at DESC"
  ).all();
  return jsonResponse(results);
}
