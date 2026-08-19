import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Briefcase, FileText, Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const { env } = await getCloudflareContext();

  const [jobsCount, appsCount, recentApps] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) as count FROM jobs WHERE is_active = 1").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) as count FROM applications").first<{ count: number }>(),
    env.DB.prepare(
      `SELECT a.name, a.email, a.created_at, j.title as job_title
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       ORDER BY a.created_at DESC LIMIT 5`
    ).all<{ name: string; email: string; created_at: string; job_title: string }>(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Briefcase size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{jobsCount?.count || 0}</p>
            <p className="text-sm text-gray-500">Active Jobs</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <FileText size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{appsCount?.count || 0}</p>
            <p className="text-sm text-gray-500">Total Applications</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Users size={24} className="text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{recentApps.results.length}</p>
            <p className="text-sm text-gray-500">Recent (last 5)</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex gap-3 mb-8">
        <Link href="/admin/jobs" className="btn-primary">
          Manage Jobs
        </Link>
        <Link href="/admin/applications" className="btn-outline">
          View Applications
        </Link>
      </div>

      {/* Recent Applications */}
      <div className="card">
        <h2 className="font-semibold text-lg mb-4">Recent Applications</h2>
        {recentApps.results.length === 0 ? (
          <p className="text-gray-500 text-sm">No applications yet.</p>
        ) : (
          <div className="space-y-3">
            {recentApps.results.map((app, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-sm">{app.name}</p>
                  <p className="text-xs text-gray-500">
                    Applied for {app.job_title}
                  </p>
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
