import Link from "next/link";
import { LayoutDashboard, Briefcase, FileText, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-primary text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-white/10">
          <Link href="/admin" className="font-bold text-lg">
            SD<span className="text-accent">Tech</span>
            <span className="text-xs ml-2 opacity-60">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link
            href="/admin/jobs"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            <Briefcase size={16} /> Jobs
          </Link>
          <Link
            href="/admin/applications"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            <FileText size={16} /> Applications
          </Link>
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors text-white/60"
          >
            <LogOut size={16} /> Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-surface p-6 overflow-auto">{children}</main>
    </div>
  );
}
