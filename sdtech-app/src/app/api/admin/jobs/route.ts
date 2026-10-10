import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isApiAuthorized } from "@/lib/auth";
import { jsonResponse, errorResponse, handleOptions } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleOptions();
}

// GET /api/admin/jobs  -> all jobs (active + inactive) for admin
export async function GET(request: Request) {
  if (!isApiAuthorized(request)) return errorResponse("Unauthorized", 401);

  const { env } = await getCloudflareContext();
  const { results } = await env.DB.prepare(
    "SELECT * FROM jobs ORDER BY created_at DESC"
  ).all();

  return jsonResponse(results);
}

// POST /api/admin/jobs  -> create a job
export async function POST(request: Request) {
  if (!isApiAuthorized(request)) return errorResponse("Unauthorized", 401);

  let body: {
    title?: string;
    company?: string;
    location?: string;
    job_type?: string;
    description?: string;
  };
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body");
  }

  const title = body.title?.trim();
  const company = body.company?.trim();
  const location = body.location?.trim();
  const job_type = body.job_type?.trim() || "full-time";
  const description = body.description?.trim() || null;

  if (!title || !company || !location) {
    return errorResponse("Title, company, and location are required");
  }

  const { env } = await getCloudflareContext();
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO jobs (id, title, company, location, job_type, description)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(id, title, company, location, job_type, description)
    .run();

  return jsonResponse({ success: true, id }, 201);
}
