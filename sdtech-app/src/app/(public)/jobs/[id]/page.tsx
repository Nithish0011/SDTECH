import Link from "next/link";
import { MapPin, Building2, Clock, ArrowLeft } from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ApplySection } from "./apply-section";

export const dynamic = "force-dynamic";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  description: string | null;
  created_at: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { env } = await getCloudflareContext();
  const job = await env.DB.prepare("SELECT * FROM jobs WHERE id = ?")
    .bind(id)
    .first<Job>();

  if (!job) return { title: "Job Not Found" };

  return {
    title: `${job.title} at ${job.company}`,
    description: job.description?.slice(0, 160) || `Apply for ${job.title} at ${job.company}`,
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { env } = await getCloudflareContext();
  const job = await env.DB.prepare("SELECT * FROM jobs WHERE id = ? AND is_active = 1")
    .bind(id)
    .first<Job>();

  if (!job) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4"
      >
        <ArrowLeft size={16} /> All Positions
      </Link>

      {/* Job Info */}
      <div className="card">
        <h1 className="text-xl md:text-2xl font-bold text-primary">{job.title}</h1>
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1 bg-surface px-2 py-1 rounded">
            <Building2 size={12} /> {job.company}
          </span>
          <span className="flex items-center gap-1 bg-surface px-2 py-1 rounded">
            <MapPin size={12} /> {job.location}
          </span>
          <span className="flex items-center gap-1 bg-surface px-2 py-1 rounded">
            <Clock size={12} /> {job.job_type}
          </span>
        </div>

        {/* Description */}
        {job.description && (
          <div className="mt-5 pt-5 border-t border-border">
            <h2 className="font-semibold text-sm text-primary mb-2">About This Role</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
          </div>
        )}
      </div>

      {/* Apply Section - hidden behind button */}
      <ApplySection jobId={job.id} jobTitle={job.title} />
    </div>
  );
}
