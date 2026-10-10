import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isApiAuthorized } from "@/lib/auth";
import { jsonResponse, errorResponse, handleOptions } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleOptions();
}

// GET /api/admin/stats  -> dashboard counts + recent applications
export async function GET(request: Request) {
  if (!isApiAuthorized(request)) return errorResponse("Unauthorized", 401);

  const { env } = await getCloudflareContext();

  const [activeJobs, totalJobs, totalApps, recent] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) as c FROM jobs WHERE is_active = 1").first<{ c: number }>(),
    env.DB.prepare("SELECT COUNT(*) as c FROM jobs").first<{ c: number }>(),
    env.DB.prepare("SELECT COUNT(*) as c FROM applications").first<{ c: number }>(),
    env.DB.prepare(
      `SELECT a.name, a.phone, a.created_at, j.title as job_title
       FROM applications a JOIN jobs j ON a.job_id = j.id
       ORDER BY a.created_at DESC LIMIT 5`
    ).all(),
  ]);

  return jsonResponse({
    activeJobs: activeJobs?.c || 0,
    totalJobs: totalJobs?.c || 0,
    totalApplications: totalApps?.c || 0,
    recentApplications: recent.results,
  });
}
