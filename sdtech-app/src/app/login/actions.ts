"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Change this token to your own secret
const ADMIN_TOKEN = "Kumar@123";

export async function loginAdmin(
  _prevState: { error: string },
  formData: FormData
) {
  const token = (formData.get("token") as string)?.trim();

  if (!token) {
    return { error: "Please enter your admin token." };
  }

  if (token !== ADMIN_TOKEN) {
    return { error: "Invalid token. Please try again." };
  }

  // Set a session cookie
  const cookieStore = await cookies();
  cookieStore.set("admin_session", ADMIN_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/");
}
