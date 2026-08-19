import Link from "next/link";
import { MapPin, Building2, Clock, ChevronRight } from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Open Positions",
  description: "Explore current job openings at SD Tech. Find the role that's right for you.",
};

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  created_at: string;
}

export default async function JobsPage() {
  const { env } = await getCloudflareContext();
  const { results: jobs } = await env.DB.prepare(
    "SELECT * FROM jobs WHERE is_active = 1 ORDER BY created_at DESC"
  ).all<Job>();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Open Positions</h1>
        <p className="text-gray-500 mt-2">
          {jobs.length} {jobs.length === 1 ? "role" : "roles"} available
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📭</p>
          <h3 className="font-semibold text-lg">No open positions right now</h3>
          <p className="text-gray-500 mt-1">Check back soon — we&apos;re always growing.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="card flex items-center justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                  {job.title}
                </h3>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Building2 size={14} /> {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {job.job_type}
                  </span>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400 group-hover:text-accent transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
