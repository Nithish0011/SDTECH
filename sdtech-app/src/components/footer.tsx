export function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white/70">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/shivaduti_logo.png"
            alt="Shivaduti"
            className="h-10 w-auto object-contain brightness-0 invert"
          />
          <div className="flex gap-6 text-sm">
            <a href="/jobs" className="hover:text-white transition-colors">
              Careers
            </a>
            <a href="mailto:contact@sdtech.com" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Shivaduti. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
