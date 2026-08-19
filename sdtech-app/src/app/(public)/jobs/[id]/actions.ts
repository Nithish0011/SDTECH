"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";

// Configure your WhatsApp number here (with country code, no + or spaces)
const WHATSAPP_NUMBER = "919160609799"; // TODO: Change to your actual number

export type ApplyState = {
  success: boolean;
  error: string;
  whatsappUrl: string;
};

export async function submitApplication(
  _prevState: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  const jobId = formData.get("jobId") as string;
  const jobTitle = formData.get("jobTitle") as string;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const experience = (formData.get("experience") as string)?.trim() || "";

  // Validation
  if (!name || !email || !phone) {
    return { success: false, error: "Name, email, and phone are required.", whatsappUrl: "" };
  }

  if (!email.includes("@") || !email.includes(".")) {
    return { success: false, error: "Please enter a valid email address.", whatsappUrl: "" };
  }

  try {
    const { env } = await getCloudflareContext();

    // Verify job exists and is active
    const job = await env.DB.prepare("SELECT id FROM jobs WHERE id = ? AND is_active = 1")
      .bind(jobId)
      .first();
    if (!job) {
      return { success: false, error: "This job is no longer available.", whatsappUrl: "" };
    }

    // Save application to D1 (acts as your spreadsheet)
    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO applications (id, job_id, name, email, phone, experience)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(id, jobId, name, email, phone, experience || null)
      .run();

    // Generate WhatsApp link with pre-filled message
    const message = encodeURIComponent(
      `Hi, I'd like to apply for the *${jobTitle}* position.\n\n` +
        `Name: ${name}\n` +
        `Phone: ${phone}\n` +
        `Email: ${email}\n` +
        `Experience: ${experience || "N/A"}\n\n` +
        `Please share further details about this role.`
    );
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    return { success: true, error: "", whatsappUrl };
  } catch (err) {
    console.error("Application submission error:", err);
    return { success: false, error: "Something went wrong. Please try again.", whatsappUrl: "" };
  }
}
