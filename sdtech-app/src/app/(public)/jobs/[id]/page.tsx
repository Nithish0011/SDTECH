import Link from "next/link";
import { MapPin, Building2, Clock, ArrowLeft } from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ApplyForm } from "./apply-form";

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
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6"
      >
        <ArrowLeft size={16} /> All Positions
      </Link>

      <div className="card mb-8">
        <h1 className="text-2xl font-bold text-primary">{job.title}</h1>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
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
        {job.description && (
          <p className="mt-6 text-gray-600 whitespace-pre-wrap leading-relaxed">
            {job.description}
          </p>
        )}
      </div>

      {/* Apply Form */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Apply for this position
        </h2>
        <ApplyForm jobId={job.id} jobTitle={job.title} />
      </div>
    </div>
  );
}
