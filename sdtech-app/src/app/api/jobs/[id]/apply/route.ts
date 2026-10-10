import { getCloudflareContext } from "@opennextjs/cloudflare";
import { jsonResponse, errorResponse, handleOptions } from "@/lib/api-helpers";
import { WHATSAPP_NUMBER } from "@/lib/config";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleOptions();
}

// POST /api/jobs/[id]/apply  { name, email, phone, experience }  (public, no auth)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;

  let body: {
    name?: string;
    email?: string;
    phone?: string;
    experience?: string;
  };
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body");
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim();
  const experience = body.experience?.trim() || "";

  if (!name || !email || !phone) {
    return errorResponse("Name, email, and phone are required");
  }
  if (!email.includes("@") || !email.includes(".")) {
    return errorResponse("Please enter a valid email address");
  }

  const { env } = await getCloudflareContext();

  // Verify job exists and is active
  const job = await env.DB.prepare(
    "SELECT id, title FROM jobs WHERE id = ? AND is_active = 1"
  )
    .bind(jobId)
    .first<{ id: string; title: string }>();

  if (!job) return errorResponse("This job is no longer available", 404);

  // Save application to D1
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO applications (id, job_id, name, email, phone, experience)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(id, jobId, name, email, phone, experience || null)
    .run();

  // Build WhatsApp deep link with pre-filled message
  const message = encodeURIComponent(
    `Hi, I'd like to apply for the *${job.title}* position.\n\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Email: ${email}\n` +
      `Experience: ${experience || "N/A"}\n\n` +
      `Please share further details about this role.`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return jsonResponse({ success: true, whatsappUrl });
}
