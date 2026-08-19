import Link from "next/link";
import { Briefcase } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          SD<span className="text-accent">Tech</span>
          <span className="w-2 h-2 bg-accent rounded-full" />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/"
            className="px-3 py-2 rounded-lg hover:bg-surface transition-colors"
          >
            Home
          </Link>
          <Link
            href="/jobs"
            className="px-3 py-2 rounded-lg hover:bg-surface transition-colors flex items-center gap-1"
          >
            <Briefcase size={16} />
            Careers
          </Link>
          <Link
            href="/admin"
            className="ml-2 px-3 py-2 text-xs bg-surface rounded-lg hover:bg-surface-dark transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
