import Link from "next/link";
import { LayoutDashboard, Briefcase, FileText, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Top nav for mobile (replaces sidebar) */}
      <nav className="bg-primary text-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/admin" className="font-bold text-lg">
            SD<span className="text-accent">Tech</span>
            <span className="text-xs ml-1 opacity-60">Admin</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-white/60 hover:text-white flex items-center gap-1"
          >
            <LogOut size={14} /> Exit
          </Link>
        </div>
        <div className="flex gap-1 px-3 pb-2 overflow-x-auto">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap hover:bg-white/10 transition-colors"
          >
            <LayoutDashboard size={14} /> Dashboard
          </Link>
          <Link
            href="/admin/jobs"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap hover:bg-white/10 transition-colors"
          >
            <Briefcase size={14} /> Jobs
          </Link>
          <Link
            href="/admin/applications"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap hover:bg-white/10 transition-colors"
          >
            <FileText size={14} /> Applications
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="p-4 max-w-4xl mx-auto">{children}</main>
    </div>
  );
}
