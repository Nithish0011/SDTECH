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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Applications</h1>
        {applications.length > 0 && (
          <a
            href="/api/export-csv"
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <Download size={16} /> Export CSV
          </a>
        )}
      </div>

      {applications.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No applications received yet.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-semibold">Name</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Phone</th>
                <th className="pb-3 font-semibold">Job</th>
                <th className="pb-3 font-semibold">Experience</th>
                <th className="pb-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-medium">{app.name}</td>
                  <td className="py-3 text-gray-600">{app.email}</td>
                  <td className="py-3 text-gray-600">{app.phone}</td>
                  <td className="py-3">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      {app.job_title}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{app.experience || "—"}</td>
                  <td className="py-3 text-gray-400 text-xs">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
