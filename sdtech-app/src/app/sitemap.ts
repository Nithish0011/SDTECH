import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sdtech.pages.dev"; // Change to your domain

  const { env } = await getCloudflareContext();
  const { results: jobs } = await env.DB.prepare(
    "SELECT id, created_at FROM jobs WHERE is_active = 1"
  ).all<{ id: string; created_at: string }>();

  const jobUrls = jobs.map((job) => ({
    url: `${baseUrl}/jobs/${job.id}`,
    lastModified: new Date(job.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...jobUrls,
  ];
}
