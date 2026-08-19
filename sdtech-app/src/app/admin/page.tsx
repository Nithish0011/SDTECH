import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Briefcase, FileText } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const { env } = await getCloudflareContext();

  const [jobsCount, appsCount, recentApps] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) as count FROM jobs WHERE is_active = 1").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) as count FROM applications").first<{ count: number }>(),
    env.DB.prepare(
      `SELECT a.name, a.phone, a.created_at, j.title as job_title
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       ORDER BY a.created_at DESC LIMIT 5`
    ).all<{ name: string; phone: string; created_at: string; job_title: string }>(),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-primary mb-4">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Briefcase size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold">{jobsCount?.count || 0}</p>
            <p className="text-xs text-gray-500">Active Jobs</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FileText size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold">{appsCount?.count || 0}</p>
            <p className="text-xs text-gray-500">Applications</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex gap-2 mb-6">
        <Link href="/admin/jobs" className="btn-primary text-xs">
          Manage Jobs
        </Link>
        <Link href="/admin/applications" className="btn-outline text-xs">
          View Applications
        </Link>
      </div>

      {/* Recent Applications */}
      <div className="card">
        <h2 className="font-semibold text-sm mb-3">Recent Applications</h2>
        {recentApps.results.length === 0 ? (
          <p className="text-gray-500 text-xs">No applications yet.</p>
        ) : (
          <div className="space-y-2">
            {recentApps.results.map((app, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-sm">{app.name}</p>
                  <p className="text-xs text-gray-500">{app.job_title}</p>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(app.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
