import Link from "next/link";
import { Briefcase } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/shivaduti_logo.png"
            alt="Shivaduti"
            className="h-10 w-auto object-contain"
          />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/jobs"
            className="px-3 py-2 rounded-lg hover:bg-surface transition-colors flex items-center gap-1 text-primary/70 hover:text-primary"
          >
            <Briefcase size={14} />
            <span className="hidden sm:inline">Careers</span>
          </Link>
          <Link
            href="/login"
            className="px-3 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
