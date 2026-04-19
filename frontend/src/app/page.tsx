"use client";

import {
  faNetworkWired,
  faShieldAlt,
  faChartLine,
  faServer,
  faMapMarkedAlt,
  faCode,
  faDownload,
  faTags,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Navbar } from "@/components/ui/Navbar";
import { PublicRoute } from "@/components/auth/AuthGuard";

const FEATURES = [
  {
    icon: faNetworkWired,
    title: "Network Topology",
    desc: "Visualize and manage your entire network topology with an interactive real-time canvas of devices and connections.",
    gradient: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    border: "hover:border-blue-200",
  },
  {
    icon: faServer,
    title: "Device Management",
    desc: "Onboard, configure, and monitor network devices. Manage OS versions, tags, sites, and operational states in one place.",
    gradient: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    border: "hover:border-violet-200",
  },
  {
    icon: faShieldAlt,
    title: "Security & RBAC",
    desc: "Role-based access control with Owner, Admin, Engineer, and Viewer roles — keeping every action safe and auditable.",
    gradient: "from-emerald-500 to-teal-500",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "hover:border-emerald-200",
  },
  {
    icon: faChartLine,
    title: "Analytics & Monitoring",
    desc: "Track live metrics and health data via Zabbix integration. Get instant alerts and trend graphs for your infrastructure.",
    gradient: "from-orange-500 to-amber-500",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    border: "hover:border-orange-200",
  },
  {
    icon: faCode,
    title: "Template Config",
    desc: "Push configuration templates to multiple devices simultaneously using Netconf/YANG, reducing repetitive manual tasks.",
    gradient: "from-pink-500 to-rose-500",
    iconBg: "bg-pink-50",
    iconColor: "text-pink-600",
    border: "hover:border-pink-200",
  },
  {
    icon: faDownload,
    title: "Backup & Recovery",
    desc: "Schedule automatic config backups, compare diffs between versions, and restore devices with a single click.",
    gradient: "from-indigo-500 to-blue-600",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    border: "hover:border-indigo-200",
  },
  {
    icon: faMapMarkedAlt,
    title: "IPAM",
    desc: "Full IP Address Management — sections, subnets, and address allocation — visualized with an interactive space map.",
    gradient: "from-cyan-500 to-sky-600",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    border: "hover:border-cyan-200",
  },
  {
    icon: faTags,
    title: "Tags & Sites",
    desc: "Organize devices with flexible tags and group them by physical sites — data centers, branches, and more.",
    gradient: "from-lime-500 to-green-600",
    iconBg: "bg-lime-50",
    iconColor: "text-lime-700",
    border: "hover:border-lime-200",
  },
];

const STATS = [
  { value: "24/7", label: "Monitoring" },
  { value: "RBAC", label: "Access Control" },
  { value: "Netconf", label: "Automation" },
  { value: "Live", label: "Analytics" },
];

export default function HomePage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-white font-sf-pro">
        <Navbar />

        {/* Subtle top gradient wash */}
        <div className="absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-primary-50/70 via-white to-white pointer-events-none" />

        <main className="relative z-10">
          {/* ── Hero ─────────────────────────────────────── */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Control and Management Network System
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 font-sf-pro-display text-gray-900">
              Welcome to
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-cyan-500 to-violet-500">
                CMNS‑SDN
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              system for network management and automation on SDN Architecture
            </p>

            {/* ── Stats Bar ─────────────────────────────── */}
            <div className="inline-flex flex-wrap justify-center gap-10 bg-gray-50 border border-gray-100 rounded-2xl px-12 py-6 shadow-sm">
              {STATS.map((s, i) => (
                <div key={s.label} className="flex items-center gap-10">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 font-sf-pro-display">
                      {s.value}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 uppercase tracking-wider">
                      {s.label}
                    </div>
                  </div>
                  {i < STATS.length - 1 && (
                    <div className="w-px h-8 bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── Divider ───────────────────────────────────── */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-12">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-gray-400 text-sm uppercase tracking-widest font-medium">
                Core Features
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
          </div>

          {/* ── Feature Grid ──────────────────────────────── */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className={`group relative bg-white border border-gray-100 ${f.border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col`}
                >
                  {/* Gradient top accent line */}
                  <div
                    className={`absolute top-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 ${f.iconBg} rounded-xl mb-4 flex-shrink-0`}
                  >
                    <FontAwesomeIcon
                      icon={f.icon}
                      className={`w-5 h-5 ${f.iconColor}`}
                    />
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 mb-2 font-sf-pro-display">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Footer note ───────────────────────────────── */}
          <div className="text-center pb-10 text-gray-300 text-sm">
            © {new Date().getFullYear()} CMNS‑SDN · FNP Network Management
          </div>
        </main>
      </div>
    </PublicRoute>
  );
}
