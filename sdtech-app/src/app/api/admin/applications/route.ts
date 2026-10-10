import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isApiAuthorized } from "@/lib/auth";
import { jsonResponse, errorResponse, handleOptions } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleOptions();
}

// GET /api/admin/applications  -> all applications with job title
// Optional query: ?jobId=<id> to filter by a job
export async function GET(request: Request) {
  if (!isApiAuthorized(request)) return errorResponse("Unauthorized", 401);

  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId");

  const { env } = await getCloudflareContext();

  let query =
    `SELECT a.*, j.title as job_title, j.company
     FROM applications a
     JOIN jobs j ON a.job_id = j.id`;
  const binds: string[] = [];

  if (jobId) {
    query += " WHERE a.job_id = ?";
    binds.push(jobId);
  }
  query += " ORDER BY a.created_at DESC";

  const { results } = await env.DB.prepare(query).bind(...binds).all();
  return jsonResponse(results);
}
