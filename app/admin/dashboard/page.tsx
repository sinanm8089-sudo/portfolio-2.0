"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import {
  FolderGit2,
  Cpu,
  Award,
  Linkedin,
  Mail,
  Database,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Activity,
} from "lucide-react";

interface DashboardState {
  loading: boolean;
  dbConnected: boolean;
  dbError?: string;
  stats: {
    totalProjects: number;
    totalSkills: number;
    totalCertifications: number;
    totalLinkedInPosts: number;
    totalMessages: number;
    unreadMessages: number;
  };
  recentMessages: Array<{
    id: string;
    senderName: string;
    senderEmail: string;
    subject: string;
    status: string;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    details?: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<DashboardState>({
    loading: true,
    dbConnected: false,
    stats: {
      totalProjects: 0,
      totalSkills: 0,
      totalCertifications: 0,
      totalLinkedInPosts: 0,
      totalMessages: 0,
      unreadMessages: 0,
    },
    recentMessages: [],
    recentActivity: [],
  });

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/dashboard");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const json = await res.json();
      if (json.ok) {
        setState({
          loading: false,
          dbConnected: json.dbConnected,
          dbError: json.dbError,
          stats: json.stats,
          recentMessages: json.recentMessages || [],
          recentActivity: json.recentActivity || [],
        });
      }
    }
    load();
  }, [router]);

  return (
    <AdminShell
      title="Command Center Overview"
      subtitle="Universal Portfolio 2.0 Content Management & PostgreSQL Telemetry"
    >
      <div className="space-y-6">
        {/* Database Status Banner */}
        <div
          className={`rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            state.dbConnected
              ? "border-cyber-green/40 bg-cyber-green/10"
              : "border-cyber-amber/50 bg-cyber-amber/10"
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            {state.dbConnected ? (
              <CheckCircle2 className="h-5 w-5 text-cyber-green shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-cyber-amber shrink-0" />
            )}
            <div className="font-mono text-xs">
              <div className="font-bold text-cyber-text">
                {state.dbConnected
                  ? "Database: CONNECTED & ACTIVE"
                  : "Database Connection Pending"}
              </div>
              <div className="text-cyber-muted mt-0.5">
                {state.dbConnected
                  ? "All CMS mutations write directly to the database and revalidate public pages."
                  : "Database connection unreachable."}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
            <Database className="h-4 w-4 text-cyber-cyan" />
            <span className="text-cyber-cyan">Prisma ORM v6</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/projects"
            className="cyber-card rounded-lg p-5 flex items-center justify-between"
          >
            <div>
              <div className="font-mono text-xs text-cyber-muted">
                TOTAL PROJECTS
              </div>
              <div className="font-mono text-3xl font-bold text-cyber-green mt-1">
                {state.stats.totalProjects}
              </div>
              <div className="font-mono text-[11px] text-cyber-cyan mt-2 flex items-center gap-1">
                <span>Manage Projects</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
            <FolderGit2 className="h-8 w-8 text-cyber-green/60" />
          </Link>

          <Link
            href="/admin/skills"
            className="cyber-card rounded-lg p-5 flex items-center justify-between"
          >
            <div>
              <div className="font-mono text-xs text-cyber-muted">
                TECHNICAL SKILLS
              </div>
              <div className="font-mono text-3xl font-bold text-cyber-cyan mt-1">
                {state.stats.totalSkills}
              </div>
              <div className="font-mono text-[11px] text-cyber-green mt-2 flex items-center gap-1">
                <span>Manage Skill Matrix</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
            <Cpu className="h-8 w-8 text-cyber-cyan/60" />
          </Link>

          <Link
            href="/admin/messages"
            className="cyber-card rounded-lg p-5 flex items-center justify-between"
          >
            <div>
              <div className="font-mono text-xs text-cyber-muted">
                CONTACT INBOX ({state.stats.unreadMessages} UNREAD)
              </div>
              <div className="font-mono text-3xl font-bold text-cyber-green mt-1">
                {state.stats.totalMessages}
              </div>
              <div className="font-mono text-[11px] text-cyber-cyan mt-2 flex items-center gap-1">
                <span>Open Inbox &amp; Reply</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
            <Mail className="h-8 w-8 text-cyber-green/60" />
          </Link>

          <Link
            href="/admin/certifications"
            className="cyber-card rounded-lg p-5 flex items-center justify-between"
          >
            <div>
              <div className="font-mono text-xs text-cyber-muted">
                VERIFIED CERTIFICATIONS
              </div>
              <div className="font-mono text-3xl font-bold text-cyber-text mt-1">
                {state.stats.totalCertifications}
              </div>
              <div className="font-mono text-[11px] text-cyber-green mt-2 flex items-center gap-1">
                <span>Manage Credentials</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
            <Award className="h-8 w-8 text-cyber-cyan/60" />
          </Link>

          <Link
            href="/admin/linkedin"
            className="cyber-card rounded-lg p-5 flex items-center justify-between"
          >
            <div>
              <div className="font-mono text-xs text-cyber-muted">
                LINKEDIN POSTS
              </div>
              <div className="font-mono text-3xl font-bold text-cyber-text mt-1">
                {state.stats.totalLinkedInPosts}
              </div>
              <div className="font-mono text-[11px] text-cyber-cyan mt-2 flex items-center gap-1">
                <span>Manage Dispatches</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
            <Linkedin className="h-8 w-8 text-cyber-cyan/60" />
          </Link>

          <Link
            href="/admin/settings"
            className="cyber-card rounded-lg p-5 flex items-center justify-between"
          >
            <div>
              <div className="font-mono text-xs text-cyber-muted">
                GLOBAL SITE &amp; HERO
              </div>
              <div className="font-mono text-lg font-bold text-cyber-green mt-1">
                Configure Identity
              </div>
              <div className="font-mono text-[11px] text-cyber-cyan mt-2 flex items-center gap-1">
                <span>Edit Bio, CTAs &amp; Alerts</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
            <Activity className="h-8 w-8 text-cyber-green/60" />
          </Link>
        </div>

        {/* Recent Messages & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="cyber-card rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <h2 className="font-mono text-sm font-bold text-cyber-green">
                Recent Contact Transmissions
              </h2>
              <Link
                href="/admin/messages"
                className="font-mono text-xs text-cyber-cyan hover:underline"
              >
                View All →
              </Link>
            </div>
            {state.recentMessages.length === 0 ? (
              <p className="font-mono text-xs text-cyber-muted py-4">
                No incoming messages yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {state.recentMessages.map((m) => (
                  <Link
                    key={m.id}
                    href="/admin/messages"
                    className="block rounded border border-cyber-border bg-cyber-black/60 p-3 hover:border-cyber-green/40"
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold text-cyber-text">
                        {m.senderName} ({m.senderEmail})
                      </span>
                      <span className="text-cyber-cyan">{m.status}</span>
                    </div>
                    <div className="font-mono text-xs text-cyber-muted mt-1 truncate">
                      {m.subject}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="cyber-card rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <h2 className="font-mono text-sm font-bold text-cyber-cyan">
                Admin Activity Audit Log
              </h2>
            </div>
            {state.recentActivity.length === 0 ? (
              <p className="font-mono text-xs text-cyber-muted py-4">
                Activity logs will appear here as you create or update content.
              </p>
            ) : (
              <div className="space-y-2">
                {state.recentActivity.map((act) => (
                  <div
                    key={act.id}
                    className="rounded border border-cyber-border bg-cyber-black/60 p-2.5 font-mono text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-cyber-green font-bold">
                        [{act.action}]
                      </span>{" "}
                      <span className="text-cyber-text">
                        {act.details || act.entityType}
                      </span>
                    </div>
                    <span className="text-[10px] text-cyber-muted shrink-0">
                      {new Date(act.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

