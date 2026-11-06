"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Cpu,
  Briefcase,
  Award,
  Linkedin,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  RefreshCw,
  Terminal,
  ShieldCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/admin/projects", icon: FolderGit2 },
  { label: "Skills & Matrix", href: "/admin/skills", icon: Cpu },
  { label: "Experience & Edu", href: "/admin/experience", icon: Briefcase },
  { label: "Certifications", href: "/admin/certifications", icon: Award },
  { label: "LinkedIn Posts", href: "/admin/linkedin", icon: Linkedin },
  { label: "Contact Inbox", href: "/admin/messages", icon: Mail },
  { label: "Site & Hero Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  async function handlePublish() {
    setPublishing(true);
    setPublishSuccess(false);
    try {
      const res = await fetch("/api/admin/publish", { method: "POST" });
      if (res.ok) {
        setPublishSuccess(true);
        setTimeout(() => setPublishSuccess(false), 3000);
      }
    } finally {
      setPublishing(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-text flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-cyber-border bg-cyber-surface shrink-0 flex flex-col justify-between">
        <div>
          <div className="border-b border-cyber-border px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-cyber-green">
              <Terminal className="h-4 w-4 text-cyber-cyan" />
              <span>PORTFOLIO 2.0 // CMS</span>
            </div>
            <ShieldCheck className="h-4 w-4 text-cyber-green" />
          </div>

          <nav className="p-3 space-y-1 flex lg:flex-col overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded px-3 py-2 font-mono text-xs whitespace-nowrap transition-all ${
                    active
                      ? "bg-cyber-green/15 text-cyber-green border border-cyber-green/40 font-semibold"
                      : "text-cyber-muted hover:bg-cyber-panel hover:text-cyber-text border border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block border-t border-cyber-border p-4 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded border border-cyber-border bg-cyber-panel px-3 py-2 font-mono text-xs text-cyber-cyan hover:border-cyber-cyan/50"
          >
            <span>View Public Website</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between rounded border border-cyber-red/30 bg-cyber-red/10 px-3 py-2 font-mono text-xs text-cyber-red hover:bg-cyber-red/20"
          >
            <span>Terminate Session</span>
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="border-b border-cyber-border bg-cyber-surface/70 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-mono text-xl font-bold text-cyber-text">
              {title}
            </h1>
            {subtitle && (
              <p className="font-mono text-xs text-cyber-muted mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-2 rounded border border-cyber-green bg-cyber-green px-4 py-1.5 font-mono text-xs font-bold text-cyber-black hover:bg-cyber-green/90 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${publishing ? "animate-spin" : ""}`}
              />
              <span>
                {publishSuccess
                  ? "Published & Revalidated!"
                  : publishing
                  ? "Publishing..."
                  : "Publish Live Changes"}
              </span>
            </button>
            <Link
              href="/"
              className="lg:hidden rounded border border-cyber-cyan/40 px-3 py-1.5 font-mono text-xs text-cyber-cyan"
            >
              Public Site
            </Link>
          </div>
        </header>

        <main className="p-6 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

