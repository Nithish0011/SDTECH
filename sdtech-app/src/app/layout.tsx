import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SD Tech - Connecting Talent with Opportunity",
    template: "%s | SD Tech",
  },
  description:
    "SD Tech is a leading recruitment agency connecting talented professionals with top organizations across industries.",
  keywords: ["recruitment", "jobs", "hiring", "staffing", "SD Tech"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
