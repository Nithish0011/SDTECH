import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Plus, Eye, EyeOff } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DeleteJobButton } from "./delete-button";

export const dynamic = "force-dynamic";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  is_active: number;
  created_at: string;
}

async function createJob(formData: FormData) {
  "use server";
  const { env } = await getCloudflareContext();
  const title = (formData.get("title") as string)?.trim();
  const company = (formData.get("company") as string)?.trim();
  const location = (formData.get("location") as string)?.trim();
  const job_type = (formData.get("job_type") as string) || "full-time";
  const description = (formData.get("description") as string)?.trim();

  if (!title || !company || !location) return;

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO jobs (id, title, company, location, job_type, description)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(id, title, company, location, job_type, description || null)
    .run();

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  redirect("/admin/jobs");
}

async function deleteJob(jobId: string) {
  "use server";
  const { env } = await getCloudflareContext();

  await env.DB.prepare("DELETE FROM applications WHERE job_id = ?").bind(jobId).run();
  await env.DB.prepare("DELETE FROM jobs WHERE id = ?").bind(jobId).run();

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
}

async function toggleJob(formData: FormData) {
  "use server";
  const { env } = await getCloudflareContext();
  const jobId = formData.get("jobId") as string;
  const currentActive = formData.get("isActive") as string;
  const newActive = currentActive === "1" ? 0 : 1;

  await env.DB.prepare("UPDATE jobs SET is_active = ? WHERE id = ?")
    .bind(newActive, jobId)
    .run();

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
}

export default async function AdminJobsPage() {
  const { env } = await getCloudflareContext();
  const { results: jobs } = await env.DB.prepare(
    "SELECT * FROM jobs ORDER BY created_at DESC"
  ).all<Job>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Manage Jobs</h1>

      {/* Create Job Form */}
      <details className="card mb-6 group">
        <summary className="cursor-pointer font-semibold flex items-center gap-2 text-primary">
          <Plus size={18} /> Post New Job
        </summary>
        <form action={createJob} className="mt-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Job Title *</label>
              <input name="title" required placeholder="e.g. Frontend Developer" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company *</label>
              <input name="company" required placeholder="e.g. SD Tech" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location *</label>
              <input name="location" required placeholder="e.g. Bangalore, Remote" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Job Type</label>
              <select name="job_type" className="input">
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Role details, requirements, benefits..."
              className="input"
            />
          </div>
          <button type="submit" className="btn-primary">
            Post Job →
          </button>
        </form>
      </details>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No jobs posted yet. Create your first listing above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="card flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{job.title}</h3>
                  {!job.is_active && (
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Inactive</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {job.company} · {job.location} · {job.job_type}
                </p>
              </div>
              <div className="flex gap-2">
                <form action={toggleJob}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <input type="hidden" name="isActive" value={String(job.is_active)} />
                  <button
                    type="submit"
                    className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1"
                    title={job.is_active ? "Deactivate" : "Activate"}
                  >
                    {job.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                    {job.is_active ? "Hide" : "Show"}
                  </button>
                </form>
                <DeleteJobButton deleteAction={deleteJob.bind(null, job.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
