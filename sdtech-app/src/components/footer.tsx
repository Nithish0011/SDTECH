export function Footer() {
  return (
    <footer className="mt-auto bg-primary text-white/80">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-lg text-white">
            SD<span className="text-accent">Tech</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="/jobs" className="hover:text-white transition-colors">
              Careers
            </a>
            <a href="mailto:contact@sdtech.com" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
          <p className="text-xs text-white/60">
            &copy; {new Date().getFullYear()} SD Tech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
