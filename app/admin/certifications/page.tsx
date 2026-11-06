"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import { Plus, Trash2, ExternalLink } from "lucide-react";

interface CertItem {
  id: string;
  title: string;
  organization: string;
  issueDate: string;
  credentialId?: string | null;
  fileUrl?: string | null;
  description?: string | null;
}

export default function AdminCertificationsPage() {
  const router = useRouter();
  const [certs, setCerts] = useState<CertItem[]>([]);
  const [form, setForm] = useState({
    title: "",
    organization: "",
    issueDate: "2026",
    credentialId: "",
    fileUrl: "",
    description: "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  async function loadCerts() {
    const res = await fetch("/api/admin/certifications");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    if (json.ok) {
      setCerts(json.certifications || []);
    }
  }

  useEffect(() => {
    loadCerts();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const res = await fetch("/api/admin/certifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        displayOrder: certs.length + 1,
        isVisible: true,
        status: "PUBLISHED",
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setFeedback(`Error: ${json.error || "Failed"}`);
      return;
    }
    setForm({
      title: "",
      organization: "",
      issueDate: "2026",
      credentialId: "",
      fileUrl: "",
      description: "",
    });
    setFeedback("Certification saved to PostgreSQL!");
    loadCerts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this certification?")) return;
    await fetch(`/api/admin/certifications/${id}`, { method: "DELETE" });
    loadCerts();
  }

  return (
    <AdminShell
      title="Verified Certifications Management"
      subtitle="Add, verify, and manage cybersecurity credentials and PDF certificates"
    >
      <div className="space-y-6">
        {feedback && (
          <div className="rounded border border-cyber-green/40 bg-cyber-green/10 p-3 font-mono text-xs text-cyber-green">
            {feedback}
          </div>
        )}

        <form
          onSubmit={handleAdd}
          className="cyber-card rounded-lg p-5 space-y-4"
        >
          <div className="font-mono text-sm font-bold text-cyber-green">
            Add New Certification
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              required
              placeholder="Certification Title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
            />
            <input
              type="text"
              required
              placeholder="Issuing Organization *"
              value={form.organization}
              onChange={(e) =>
                setForm({ ...form, organization: e.target.value })
              }
              className="rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
            />
            <input
              type="text"
              required
              placeholder="Issue Date / Year *"
              value={form.issueDate}
              onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
              className="rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Credential ID"
              value={form.credentialId}
              onChange={(e) =>
                setForm({ ...form, credentialId: e.target.value })
              }
              className="rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
            />
            <input
              type="text"
              placeholder="Certificate PDF / Verification URL"
              value={form.fileUrl}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
              className="rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
            />
          </div>

          <textarea
            rows={2}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
          />

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded border border-cyber-green bg-cyber-green px-4 py-1.5 font-mono text-xs font-bold text-cyber-black"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Save Certification</span>
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {certs.map((c) => (
            <div
              key={c.id}
              className="cyber-card rounded-lg p-5 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-mono text-sm font-bold text-cyber-text">
                    {c.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="text-cyber-red"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="font-mono text-xs text-cyber-cyan mt-1">
                  {c.organization} ({c.issueDate})
                </div>
                {c.description && (
                  <p className="text-xs text-cyber-muted mt-2">
                    {c.description}
                  </p>
                )}
              </div>
              {c.fileUrl && (
                <a
                  href={c.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-cyber-green hover:underline"
                >
                  <span>View Credential</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

