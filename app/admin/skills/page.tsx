"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import { Plus, Trash2, Edit3 } from "lucide-react";

interface SkillCategoryItem {
  id: string;
  name: string;
  slug: string;
  terminalHeader: string;
  skills: Array<{
    id: string;
    name: string;
    commandLabel?: string | null;
    categoryId: string;
    proficiency: number;
    displayOrder: number;
    isVisible: boolean;
    isFeatured: boolean;
  }>;
}

export default function AdminSkillsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<SkillCategoryItem[]>([]);
  const [skillForm, setSkillForm] = useState({
    id: "",
    name: "",
    commandLabel: "",
    categoryId: "",
    proficiency: 80,
    displayOrder: 1,
    isVisible: true,
    isFeatured: false,
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  async function loadSkills() {
    const res = await fetch("/api/admin/skills");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    if (json.ok) {
      const cats = json.skillCategories || [];
      setCategories(cats);
      if (!skillForm.categoryId && cats.length > 0) {
        setSkillForm((prev) => ({ ...prev, categoryId: cats[0].id }));
      }
    }
  }

  useEffect(() => {
    loadSkills();
  }, []);

  async function handleSaveSkill(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    const isUpdate = Boolean(skillForm.id);
    const res = await fetch(
      isUpdate ? `/api/admin/skills/${skillForm.id}` : "/api/admin/skills",
      {
        method: isUpdate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: skillForm.name,
          commandLabel: skillForm.commandLabel || null,
          categoryId: skillForm.categoryId,
          proficiency: Number(skillForm.proficiency),
          displayOrder: Number(skillForm.displayOrder),
          isVisible: skillForm.isVisible,
          isFeatured: skillForm.isFeatured,
          status: "PUBLISHED",
        }),
      }
    );
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setFeedback(`Error: ${json.error || "Failed to save skill"}`);
      return;
    }

    setSkillForm({
      id: "",
      name: "",
      commandLabel: "",
      categoryId: skillForm.categoryId,
      proficiency: 80,
      displayOrder: 1,
      isVisible: true,
      isFeatured: false,
    });
    setFeedback("Skill saved to PostgreSQL!");
    loadSkills();
  }

  async function handleDeleteSkill(id: string) {
    if (!confirm("Delete this skill?")) return;
    const res = await fetch(`/api/admin/skills/${id}`, { method: "DELETE" });
    if (res.ok) loadSkills();
  }

  return (
    <AdminShell
      title="Skills & Technologies Matrix"
      subtitle="Add, edit, reorder, and set proficiency levels for technical skills"
    >
      <div className="space-y-6">
        {feedback && (
          <div className="rounded border border-cyber-green/40 bg-cyber-green/10 p-3 font-mono text-xs text-cyber-green">
            {feedback}
          </div>
        )}

        {/* Add / Edit Skill Form */}
        <form
          onSubmit={handleSaveSkill}
          className="cyber-card rounded-lg p-5 space-y-4"
        >
          <div className="font-mono text-sm font-bold text-cyber-green">
            {skillForm.id ? `Editing Skill: ${skillForm.name}` : "Add New Skill"}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                Skill Name *
              </label>
              <input
                type="text"
                required
                value={skillForm.name}
                onChange={(e) =>
                  setSkillForm({ ...skillForm, name: e.target.value })
                }
                placeholder="e.g. Penetration Testing"
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                Category *
              </label>
              <select
                value={skillForm.categoryId}
                onChange={(e) =>
                  setSkillForm({ ...skillForm, categoryId: e.target.value })
                }
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                Terminal Command Label
              </label>
              <input
                type="text"
                value={skillForm.commandLabel}
                onChange={(e) =>
                  setSkillForm({ ...skillForm, commandLabel: e.target.value })
                }
                placeholder="> nmap -sV target"
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                Proficiency: {skillForm.proficiency}%
              </label>
              <input
                type="range"
                min={10}
                max={100}
                value={skillForm.proficiency}
                onChange={(e) =>
                  setSkillForm({
                    ...skillForm,
                    proficiency: Number(e.target.value),
                  })
                }
                className="w-full accent-cyber-green mt-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 font-mono text-xs text-cyber-text cursor-pointer">
              <input
                type="checkbox"
                checked={skillForm.isVisible}
                onChange={(e) =>
                  setSkillForm({ ...skillForm, isVisible: e.target.checked })
                }
              />
              <span>Visible on Public Portfolio</span>
            </label>

            <div className="flex items-center gap-2">
              {skillForm.id && (
                <button
                  type="button"
                  onClick={() =>
                    setSkillForm({
                      id: "",
                      name: "",
                      commandLabel: "",
                      categoryId: categories[0]?.id || "",
                      proficiency: 80,
                      displayOrder: 1,
                      isVisible: true,
                      isFeatured: false,
                    })
                  }
                  className="rounded border border-cyber-border px-3 py-1.5 font-mono text-xs text-cyber-muted"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded border border-cyber-green bg-cyber-green px-4 py-1.5 font-mono text-xs font-bold text-cyber-black"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{skillForm.id ? "Update Skill" : "Add Skill"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Categories & Skills List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="cyber-card rounded-lg p-5 space-y-4">
              <div className="border-b border-cyber-border pb-2.5 flex items-center justify-between">
                <h3 className="font-mono text-sm font-bold text-cyber-green">
                  {cat.name}
                </h3>
                <span className="font-mono text-xs text-cyber-muted">
                  {cat.skills.length} skills
                </span>
              </div>

              <div className="space-y-2.5">
                {cat.skills.map((s) => (
                  <div
                    key={s.id}
                    className="rounded border border-cyber-border bg-cyber-black/60 p-3 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-cyber-text">
                        {s.name}{" "}
                        <span className="text-cyber-cyan">({s.proficiency}%)</span>
                      </div>
                      {s.commandLabel && (
                        <div className="font-mono text-[11px] text-cyber-muted">
                          {s.commandLabel}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setSkillForm({
                            id: s.id,
                            name: s.name,
                            commandLabel: s.commandLabel || "",
                            categoryId: cat.id,
                            proficiency: s.proficiency,
                            displayOrder: s.displayOrder,
                            isVisible: s.isVisible,
                            isFeatured: s.isFeatured,
                          })
                        }
                        className="p-1 text-cyber-cyan hover:text-cyber-green"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(s.id)}
                        className="p-1 text-cyber-red hover:opacity-80"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

