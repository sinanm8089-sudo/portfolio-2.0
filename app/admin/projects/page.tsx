"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import { Plus, Trash2, Edit3, Star, ExternalLink, Github, X } from "lucide-react";

interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  architecture?: string | null;
  keyFeatures: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
  techStack: string[];
  category: string;
  devStatus: string;
  isFeatured: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  displayOrder: number;
}

const EMPTY_FORM = {
  id: "",
  title: "",
  slug: "",
  summary: "",
  description: "",
  architecture: "",
  keyFeaturesText: "",
  githubUrl: "",
  liveUrl: "",
  techStackText: "",
  category: "Cybersecurity",
  devStatus: "Completed",
  isFeatured: true,
  status: "PUBLISHED" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
  displayOrder: 1,
};

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function loadProjects() {
    const res = await fetch("/api/admin/projects");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    if (json.ok) {
      setProjects(json.projects || []);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function startNew() {
    setForm({ ...EMPTY_FORM, displayOrder: projects.length + 1 });
    setEditing(true);
    setFeedback(null);
  }

  function startEdit(p: ProjectItem) {
    setForm({
      id: p.id,
      title: p.title,
      slug: p.slug,
      summary: p.summary,
      description: p.description,
      architecture: p.architecture || "",
      keyFeaturesText: (p.keyFeatures || []).join("\n"),
      githubUrl: p.githubUrl || "",
      liveUrl: p.liveUrl || "",
      techStackText: (p.techStack || []).join(", "),
      category: p.category,
      devStatus: p.devStatus,
      isFeatured: p.isFeatured,
      status: p.status,
      displayOrder: p.displayOrder,
    });
    setEditing(true);
    setFeedback(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    const payload = {
      title: form.title,
      slug:
        form.slug ||
        form.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      summary: form.summary,
      description: form.description,
      architecture: form.architecture || null,
      keyFeatures: form.keyFeaturesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      githubUrl: form.githubUrl.trim() || null,
      liveUrl: form.liveUrl.trim() || null,
      techStack: form.techStackText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      category: form.category,
      devStatus: form.devStatus,
      isFeatured: form.isFeatured,
      status: form.status,
      displayOrder: Number(form.displayOrder) || 0,
    };

    const isUpdate = Boolean(form.id);
    const res = await fetch(
      isUpdate ? `/api/admin/projects/${form.id}` : "/api/admin/projects",
      {
        method: isUpdate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setFeedback(`Error: ${json.error || "Failed to save project"}`);
      return;
    }

    setEditing(false);
    setFeedback("Project saved & published to PostgreSQL!");
    loadProjects();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project from PostgreSQL?")) return;
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadProjects();
    }
  }

  return (
    <AdminShell
      title="Projects Showcase Management"
      subtitle="Add, edit, reorder, feature, and publish portfolio projects"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs text-cyber-muted">
            Showing {projects.length} total projects
          </div>
          <button
            type="button"
            onClick={startNew}
            className="inline-flex items-center gap-2 rounded border border-cyber-green bg-cyber-green px-4 py-2 font-mono text-xs font-bold text-cyber-black"
          >
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
          </button>
        </div>

        {feedback && (
          <div className="rounded border border-cyber-cyan/40 bg-cyber-cyan/10 p-3 font-mono text-xs text-cyber-cyan">
            {feedback}
          </div>
        )}

        {editing && (
          <form
            onSubmit={handleSave}
            className="cyber-card rounded-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <h2 className="font-mono text-base font-bold text-cyber-green">
                {form.id ? `Edit Project: ${form.title}` : "Create New Project"}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-cyber-muted hover:text-cyber-red"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs text-cyber-green mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                      slug:
                        form.slug ||
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, ""),
                    })
                  }
                  className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-green mb-1">
                  Slug (URL ID) *
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-green mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-cyber-green mb-1">
                Short Summary (Card Preview) *
              </label>
              <input
                type="text"
                required
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-cyber-green mb-1">
                Full Project Description *
              </label>
              <textarea
                rows={3}
                required
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-cyber-green mb-1">
                  System Architecture (Popup Details)
                </label>
                <textarea
                  rows={3}
                  value={form.architecture}
                  onChange={(e) =>
                    setForm({ ...form, architecture: e.target.value })
                  }
                  className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-green mb-1">
                  Key Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={form.keyFeaturesText}
                  onChange={(e) =>
                    setForm({ ...form, keyFeaturesText: e.target.value })
                  }
                  className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs text-cyber-green mb-1">
                  Tech Stack (Comma separated)
                </label>
                <input
                  type="text"
                  value={form.techStackText}
                  onChange={(e) =>
                    setForm({ ...form, techStackText: e.target.value })
                  }
                  placeholder="Python, React, Cybersecurity"
                  className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-green mb-1">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  value={form.githubUrl}
                  onChange={(e) =>
                    setForm({ ...form, githubUrl: e.target.value })
                  }
                  className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-green mb-1">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  value={form.liveUrl}
                  onChange={(e) =>
                    setForm({ ...form, liveUrl: e.target.value })
                  }
                  className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center pt-2">
              <div>
                <label className="block font-mono text-xs text-cyber-green mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED",
                    })
                  }
                  className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
                >
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-green mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm({ ...form, displayOrder: Number(e.target.value) })
                  }
                  className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
                />
              </div>
              <label className="flex items-center gap-2 font-mono text-xs text-cyber-text pt-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) =>
                    setForm({ ...form, isFeatured: e.target.checked })
                  }
                />
                <span>Featured Project</span>
              </label>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="submit"
                  className="rounded border border-cyber-green bg-cyber-green px-5 py-2 font-mono text-xs font-bold text-cyber-black"
                >
                  Save Project
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Projects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="cyber-card rounded-lg p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-base font-bold text-cyber-text">
                      {p.title}
                    </h3>
                    {p.isFeatured && (
                      <Star className="h-3.5 w-3.5 text-cyber-green fill-cyber-green" />
                    )}
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] border ${
                      p.status === "PUBLISHED"
                        ? "border-cyber-green/40 bg-cyber-green/10 text-cyber-green"
                        : "border-cyber-amber/40 bg-cyber-amber/10 text-cyber-amber"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-cyber-muted">{p.summary}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.techStack.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-cyber-black px-2 py-0.5 font-mono text-[10px] text-cyber-cyan border border-cyber-border"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-cyber-border pt-3 font-mono text-xs">
                <div className="flex items-center gap-3">
                  {p.githubUrl && (
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyber-muted hover:text-cyber-green"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyber-muted hover:text-cyber-cyan"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="inline-flex items-center gap-1 rounded border border-cyber-border bg-cyber-panel px-2.5 py-1 text-cyber-cyan hover:border-cyber-cyan"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="inline-flex items-center gap-1 rounded border border-cyber-red/30 bg-cyber-red/10 px-2.5 py-1 text-cyber-red hover:bg-cyber-red/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

