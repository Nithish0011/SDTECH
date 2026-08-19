import Link from "next/link";
import { Briefcase, Users, Monitor, ClipboardList, Target, BarChart3 } from "lucide-react";

const services = [
  { icon: Users, title: "Permanent Recruitment", desc: "End-to-end hiring solutions for long-term growth." },
  { icon: ClipboardList, title: "Temporary Staffing", desc: "Flexible workforce for seasonal and project needs." },
  { icon: Monitor, title: "IT Resourcing", desc: "Specialized tech talent for software, data & cloud roles." },
  { icon: BarChart3, title: "Payroll Outsourcing", desc: "Comprehensive payroll management with compliance." },
  { icon: Target, title: "RPO Solutions", desc: "Scalable recruitment process outsourcing." },
  { icon: Briefcase, title: "Workforce Analytics", desc: "Data-driven insights for talent strategy." },
];

const stats = [
  { number: "500+", label: "Clients Served" },
  { number: "10K+", label: "Placements Made" },
  { number: "50+", label: "Industries" },
  { number: "98%", label: "Client Satisfaction" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-light text-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <span className="inline-block bg-white/10 text-sm px-4 py-1.5 rounded-full mb-6">
            We&apos;re Hiring
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Connecting <span className="text-accent">Talent</span> with
            <br />
            Opportunity
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
            With deep expertise across industries, we create meaningful career
            connections — linking talented individuals with organizations that
            shape the future.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs" className="btn-accent text-center">
              View Open Positions →
            </Link>
            <a href="#services" className="btn-outline border-white/30 text-white hover:bg-white/10 text-center">
              Our Services
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-surface">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{s.number}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary">
              Workforce Management Solutions
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              A full suite of HR solutions tailored for your firm&apos;s growth.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="card hover:shadow-md transition-shadow">
                <s.icon size={28} className="text-accent mb-3" />
                <h3 className="font-semibold text-primary">{s.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to Find Your Next Role?
          </h2>
          <p className="mt-3 text-white/70">
            Browse our open positions and apply today.
          </p>
          <Link href="/jobs" className="btn-accent inline-block mt-6">
            Browse Jobs →
          </Link>
        </div>
      </section>
    </>
  );
}
