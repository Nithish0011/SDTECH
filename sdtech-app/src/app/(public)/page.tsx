import Link from "next/link";
import { Search, Building2, Handshake, ArrowRight, Users, Monitor, ClipboardList, Target, BarChart3, Briefcase } from "lucide-react";

const clients = [
  { name: "Daikin", logo: "/images/clients/daikin.png" },
  { name: "Havells", logo: "/images/clients/havells.png" },
  { name: "Panasonic", logo: "/images/clients/panasonic.png" },
  { name: "Kelloggs", logo: "/images/clients/kelloggs.png" },
  { name: "Tata", logo: "/images/clients/tata.png" },
  { name: "LG Polymers", logo: "/images/clients/lg-polymers.png" },
  { name: "Cadbury", logo: "/images/clients/cadbury.png" },
  { name: "Blue Star", logo: "/images/clients/bluestar.png" },
];

const services = [
  { icon: Users, title: "Permanent Recruitment", desc: "End-to-end hiring solutions for long-term growth." },
  { icon: ClipboardList, title: "Temporary Staffing", desc: "Flexible workforce for seasonal and project needs." },
  { icon: Monitor, title: "IT Resourcing", desc: "Specialized tech talent for software, data & cloud roles." },
  { icon: BarChart3, title: "Payroll Outsourcing", desc: "Comprehensive payroll management with compliance." },
  { icon: Target, title: "RPO Solutions", desc: "Scalable recruitment process outsourcing." },
  { icon: Briefcase, title: "Workforce Analytics", desc: "Data-driven insights for talent strategy." },
];

export default function HomePage() {
  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden text-white">
        {/* Background image slideshow */}
        <div className="absolute inset-0 hero-slideshow">
          <div className="absolute inset-0 hero-slide hero-slide-1" style={{ backgroundImage: `url('/images/hero1.jpeg')` }} />
          <div className="absolute inset-0 hero-slide hero-slide-2" style={{ backgroundImage: `url('/images/hero3.jpeg')` }} />
          <div className="absolute inset-0 hero-slide hero-slide-3" style={{ backgroundImage: `url('/images/hero4.jpg')` }} />
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/85 via-[#0f172a]/75 to-[#1e293b]/85" />

        <div className="relative max-w-5xl mx-auto px-4 py-20 md:py-32 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-xs font-medium text-white/90">
              Helping careers take flight since 2014
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
            Your Next Opportunity
            <br />
            <span className="text-accent">Starts Here</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-4 text-base md:text-xl text-white/90 font-medium max-w-lg mx-auto">
            Finding the right job shouldn&apos;t be harder than doing the job.
          </p>

          {/* Supporting text */}
          <p className="mt-4 text-sm md:text-base text-white/60 max-w-2xl mx-auto leading-relaxed">
            Every year, millions of talented people enter the workforce with skills,
            ambition, and the desire to build a better future. SDTech helps connect
            that talent with meaningful career opportunities where people can learn,
            grow, and make an impact.
          </p>

          {/* CTA */}
          <div className="mt-8">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-white font-semibold px-7 py-3.5 rounded-xl text-base active:scale-[0.97] transition-all duration-200 shadow-lg shadow-accent/30"
            >
              Explore Jobs <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== PROBLEM → SOLUTION ==================== */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          {/* Section header */}
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
              Bridging the Gap Between
              <br className="hidden sm:block" />
              <span className="text-accent"> Talent and Opportunity</span>
            </h2>
          </div>

          {/* Three problem cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Card 1 - Job Seekers */}
            <div className="relative bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-6 group">
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Search size={22} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-primary text-base mb-2">For Job Seekers</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Finding relevant opportunities can be difficult among thousands
                of job listings. The right role often gets buried.
              </p>
            </div>

            {/* Card 2 - Companies */}
            <div className="relative bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl p-6 group">
              <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Building2 size={22} className="text-orange-600" />
              </div>
              <h3 className="font-bold text-primary text-base mb-2">For Companies</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Finding people with the right skills and potential can take
                time, effort, and resources that slow down growth.
              </p>
            </div>

            {/* Card 3 - The Connection */}
            <div className="relative bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-2xl p-6 group">
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Handshake size={22} className="text-green-600" />
              </div>
              <h3 className="font-bold text-primary text-base mb-2">For Everyone</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                The right connection can turn a job into a long-term career
                opportunity — one that builds skills and futures.
              </p>
            </div>
          </div>

          {/* Solution statement */}
          <div className="mt-12 md:mt-16 text-center">
            <p className="text-lg md:text-xl font-bold text-primary">
              That&apos;s where SDTech comes in.
            </p>
            <p className="mt-3 text-sm md:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
              We connect talented professionals with companies and opportunities
              that can help them take their next step — whether that&apos;s a first job,
              a career switch, or a leadership role.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 mt-6 text-accent font-semibold text-sm hover:underline"
            >
              See open positions <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== SERVICES ==================== */}
      <section className="py-14 bg-surface">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-primary">
              Our Services
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              A full suite of HR solutions tailored for your firm&apos;s growth.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {services.map((s) => (
              <div
                key={s.title}
                className="bg-white border border-border rounded-xl p-4 shadow-sm"
              >
                <s.icon size={20} className="text-accent mb-2" />
                <h3 className="font-semibold text-xs md:text-sm text-primary">{s.title}</h3>
                <p className="text-[11px] md:text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== OUR CLIENTS ==================== */}
      <section className="py-14 bg-[#f8fafc] overflow-hidden">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-primary">
              Our Clients
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              Trusted by leading companies across industries.
            </p>
          </div>
          {/* Auto-scrolling client logos */}
          <div className="clients-carousel">
            <div className="clients-track">
              {[...clients, ...clients].map((c, i) => (
                <div
                  key={`${c.name}-${i}`}
                  className="min-w-[160px] h-20 flex-shrink-0 flex items-center justify-center px-6"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.logo}
                    alt={c.name}
                    className="max-h-14 max-w-[140px] object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </> 
  );
}
