import Link from "next/link";
import { Briefcase } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 font-bold text-lg text-primary">
          SD<span className="text-accent">Tech</span>
          <span className="w-1.5 h-1.5 bg-accent rounded-full" />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/jobs"
            className="px-3 py-2 rounded-lg hover:bg-surface transition-colors flex items-center gap-1"
          >
            <Briefcase size={14} />
            <span className="hidden sm:inline">Careers</span>
          </Link>
          <Link
            href="/login"
            className="px-3 py-2 text-xs bg-surface rounded-lg hover:bg-surface-dark transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
