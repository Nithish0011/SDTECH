import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Application {
  name: string;
  email: string;
  phone: string;
  experience: string | null;
  created_at: string;
  job_title: string;
  company: string;
}

export async function GET() {
  const { env } = await getCloudflareContext();

  const { results } = await env.DB.prepare(
    `SELECT a.name, a.email, a.phone, a.experience, a.created_at,
            j.title as job_title, j.company
     FROM applications a
     JOIN jobs j ON a.job_id = j.id
     ORDER BY a.created_at DESC`
  ).all<Application>();

  // Build CSV
  const headers = ["Name", "Email", "Phone", "Experience", "Job Title", "Company", "Applied Date"];
  const rows = results.map((r) => [
    escapeCsv(r.name),
    escapeCsv(r.email),
    escapeCsv(r.phone),
    escapeCsv(r.experience || ""),
    escapeCsv(r.job_title),
    escapeCsv(r.company),
    escapeCsv(new Date(r.created_at).toLocaleDateString()),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="applications-${Date.now()}.csv"`,
    },
  });
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
