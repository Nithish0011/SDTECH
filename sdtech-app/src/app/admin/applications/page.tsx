import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

interface Application {
  id: string;
  job_id: string;
  name: string;
  email: string;
  phone: string;
  experience: string | null;
  created_at: string;
  job_title: string;
  company: string;
}

export default async function AdminApplicationsPage() {
  const { env } = await getCloudflareContext();
  const { results: applications } = await env.DB.prepare(
    `SELECT a.*, j.title as job_title, j.company
     FROM applications a
     JOIN jobs j ON a.job_id = j.id
     ORDER BY a.created_at DESC`
  ).all<Application>();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-primary">Applications</h1>
        {applications.length > 0 && (
          <a
            href="/api/export-csv"
            className="btn-outline flex items-center gap-1 text-xs"
          >
            <Download size={14} /> CSV
          </a>
        )}
      </div>

      {applications.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500 text-sm">No applications received yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mobile card layout */}
          {applications.map((app) => (
            <div key={app.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{app.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{app.phone}</p>
                  <p className="text-xs text-gray-500">{app.email}</p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded shrink-0">
                  {app.job_title}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                <span className="text-xs text-gray-400">
                  {app.experience || "No exp. listed"}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(app.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
