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
      <h1 className="text-xl font-bold text-primary mb-4">Manage Jobs</h1>

      {/* Create Job Form */}
      <details className="card mb-4 group">
        <summary className="cursor-pointer font-semibold text-sm flex items-center gap-2 text-primary">
          <Plus size={16} /> Post New Job
        </summary>
        <form action={createJob} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Job Title *</label>
            <input name="title" required placeholder="e.g. Frontend Developer" className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Company *</label>
            <input name="company" required placeholder="e.g. SD Tech" className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Location *</label>
            <input name="location" required placeholder="e.g. Bangalore, Remote" className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Job Type</label>
            <select name="job_type" className="input">
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Role details, requirements..."
              className="input"
            />
          </div>
          <button type="submit" className="btn-primary w-full py-3">
            Post Job →
          </button>
        </form>
      </details>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="card text-center py-6">
          <p className="text-gray-500 text-sm">No jobs posted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm">{job.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {job.company} · {job.location}
                  </p>
                </div>
                {!job.is_active && (
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded shrink-0">Hidden</span>
                )}
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <form action={toggleJob} className="flex-1">
                  <input type="hidden" name="jobId" value={job.id} />
                  <input type="hidden" name="isActive" value={String(job.is_active)} />
                  <button
                    type="submit"
                    className="btn-outline w-full text-xs py-2 flex items-center justify-center gap-1"
                  >
                    {job.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                    {job.is_active ? "Hide" : "Show"}
                  </button>
                </form>
                <div className="flex-1">
                  <DeleteJobButton deleteAction={deleteJob.bind(null, job.id)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
