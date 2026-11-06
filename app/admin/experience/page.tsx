"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import { Plus, Trash2 } from "lucide-react";

interface ExperienceItem {
  id: string;
  title: string;
  organization: string;
  location?: string | null;
  type: string;
  startDate: string;
  endDate?: string | null;
  description: string;
  highlights: string[];
}

interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location?: string | null;
  startYear: string;
  endYear?: string | null;
  description?: string | null;
  grade?: string | null;
}

export default function AdminExperiencePage() {
  const router = useRouter();
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [expForm, setExpForm] = useState({
    title: "",
    organization: "",
    location: "Kerala, India",
    type: "Experience",
    startDate: "2025",
    endDate: "Present",
    description: "",
    highlightsText: "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  async function loadData() {
    const res = await fetch("/api/admin/experience");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    if (json.ok) {
      setExperience(json.experience || []);
      setEducation(json.education || []);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddExperience(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const res = await fetch("/api/admin/experience", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: expForm.title,
        organization: expForm.organization,
        location: expForm.location,
        type: expForm.type,
        startDate: expForm.startDate,
        endDate: expForm.endDate,
        description: expForm.description,
        highlights: expForm.highlightsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        displayOrder: experience.length + 1,
        isVisible: true,
        status: "PUBLISHED",
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setFeedback(`Error: ${json.error || "Failed"}`);
      return;
    }
    setExpForm({
      title: "",
      organization: "",
      location: "Kerala, India",
      type: "Experience",
      startDate: "2025",
      endDate: "Present",
      description: "",
      highlightsText: "",
    });
    setFeedback("Timeline entry added to PostgreSQL!");
    loadData();
  }

  async function handleDelete(id: string, entity: "experience" | "education") {
    if (!confirm("Delete this timeline entry?")) return;
    await fetch(`/api/admin/experience/${id}?entity=${entity}`, {
      method: "DELETE",
    });
    loadData();
  }

  return (
    <AdminShell
      title="Experience & Education Timeline"
      subtitle="Manage internships, cybersecurity achievements, workshops, and academic history"
    >
      <div className="space-y-6">
        {feedback && (
          <div className="rounded border border-cyber-green/40 bg-cyber-green/10 p-3 font-mono text-xs text-cyber-green">
            {feedback}
          </div>
        )}

        <form
          onSubmit={handleAddExperience}
          className="cyber-card rounded-lg p-5 space-y-4"
        >
          <div className="font-mono text-sm font-bold text-cyber-green">
            Add Experience / Achievement / Workshop
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              required
              placeholder="Role / Title *"
              value={expForm.title}
              onChange={(e) =>
                setExpForm({ ...expForm, title: e.target.value })
              }
              className="rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
            />
            <input
              type="text"
              required
              placeholder="Organization *"
              value={expForm.organization}
              onChange={(e) =>
                setExpForm({ ...expForm, organization: e.target.value })
              }
              className="rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
            />
            <select
              value={expForm.type}
              onChange={(e) => setExpForm({ ...expForm, type: e.target.value })}
              className="rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
            >
              <option value="Experience">Experience</option>
              <option value="Internship">Internship</option>
              <option value="Achievement">Achievement / CTF</option>
              <option value="Workshop">Workshop / Event</option>
            </select>
            <input
              type="text"
              required
              placeholder="Start Year (e.g. 2025)"
              value={expForm.startDate}
              onChange={(e) =>
                setExpForm({ ...expForm, startDate: e.target.value })
              }
              className="rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              rows={2}
              required
              placeholder="Description *"
              value={expForm.description}
              onChange={(e) =>
                setExpForm({ ...expForm, description: e.target.value })
              }
              className="rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
            />
            <textarea
              rows={2}
              placeholder="Bullet highlights (One per line)"
              value={expForm.highlightsText}
              onChange={(e) =>
                setExpForm({ ...expForm, highlightsText: e.target.value })
              }
              className="rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded border border-cyber-green bg-cyber-green px-4 py-1.5 font-mono text-xs font-bold text-cyber-black"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Timeline Entry</span>
          </button>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-mono text-sm font-bold text-cyber-cyan">
              Experience &amp; Achievements ({experience.length})
            </h3>
            {experience.map((exp) => (
              <div
                key={exp.id}
                className="cyber-card rounded-lg p-4 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="font-mono text-sm font-bold text-cyber-text">
                    {exp.title}
                  </div>
                  <div className="font-mono text-xs text-cyber-green">
                    {exp.organization} · {exp.startDate} —{" "}
                    {exp.endDate || "Present"}
                  </div>
                  <p className="text-xs text-cyber-muted">{exp.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(exp.id, "experience")}
                  className="text-cyber-red p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="font-mono text-sm font-bold text-cyber-green">
              Academic Education ({education.length})
            </h3>
            {education.map((edu) => (
              <div
                key={edu.id}
                className="cyber-card rounded-lg p-4 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="font-mono text-sm font-bold text-cyber-text">
                    {edu.degree}
                  </div>
                  <div className="font-mono text-xs text-cyber-cyan">
                    {edu.institution} · {edu.startYear} —{" "}
                    {edu.endYear || "Present"}
                  </div>
                  {edu.description && (
                    <p className="text-xs text-cyber-muted">
                      {edu.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(edu.id, "education")}
                  className="text-cyber-red p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

