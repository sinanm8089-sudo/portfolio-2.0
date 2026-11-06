"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import { Save, CheckCircle2, Lock } from "lucide-react";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    siteName: "Sinan Mohammed | Cybersecurity & AI Portfolio",
    heroBadge: "[ SYS.STATUS: ONLINE ]",
    heroGreeting: "> initializing sequence...",
    heroName: "Sinan Mohammed",
    heroTitlesText:
      "Cybersecurity Student\nAI & ML Enthusiast\nFull-Stack Developer\nPenetration Tester",
    heroBio: "",
    cvUrl: "/certificates/CERT_SINAN_MOHAMMED_1760514672459.pdf",
    primaryCtaLabel: "> ./connect.sh",
    primaryCtaUrl: "#contact",
    secondaryCtaLabel: "> ./projects.sh",
    secondaryCtaUrl: "#projects",
    glitchIntensity: "MEDIUM" as "OFF" | "LOW" | "MEDIUM" | "HIGH",
    showStats: true,
    aboutHeading: "> Authentication successful.",
    aboutBio: "",
    careerObjective: "",
    location: "Malappuram, Kerala, India",
    contactEmail: "sinan.m8089@gmail.com",
    emailNotifications: true,
    notifyEmail: "sinan.m8089@gmail.com",
    clarityProjectId: "",
    maintenanceMode: false,
    disableAnimations: false,
    footerText: "© 2024 Sinan Mohammed. SYSTEM.HALTED",
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Password reset state
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passFeedback, setPassFeedback] = useState<string | null>(null);
  const [passUpdating, setPassUpdating] = useState(false);

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setPassUpdating(true);
    setPassFeedback(null);
    try {
      const res = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setPassFeedback(`Error: ${data.error || "Failed to update password"}`);
      } else {
        setPassFeedback("Success: Admin password updated successfully!");
        setCurrentPass("");
        setNewPass("");
      }
    } catch {
      setPassFeedback("Network error updating password");
    } finally {
      setPassUpdating(false);
    }
  }

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/settings");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const json = await res.json();
      if (json.ok && json.site) {
        const s = json.site;
        setForm({
          siteName: s.siteName || "",
          heroBadge: s.heroBadge || "",
          heroGreeting: s.heroGreeting || "",
          heroName: s.heroName || "",
          heroTitlesText: Array.isArray(s.heroTitles)
            ? s.heroTitles.join("\n")
            : "",
          heroBio: s.heroBio || "",
          cvUrl: s.cvUrl || "",
          primaryCtaLabel: s.primaryCtaLabel || "",
          primaryCtaUrl: s.primaryCtaUrl || "",
          secondaryCtaLabel: s.secondaryCtaLabel || "",
          secondaryCtaUrl: s.secondaryCtaUrl || "",
          glitchIntensity: s.glitchIntensity || "MEDIUM",
          showStats: Boolean(s.showStats),
          aboutHeading: s.aboutHeading || "",
          aboutBio: s.aboutBio || "",
          careerObjective: s.careerObjective || "",
          location: s.location || "",
          contactEmail: s.contactEmail || "",
          emailNotifications: Boolean(s.emailNotifications),
          notifyEmail: s.notifyEmail || "",
          clarityProjectId: s.clarityProjectId || "",
          maintenanceMode: Boolean(s.maintenanceMode),
          disableAnimations: Boolean(s.disableAnimations),
          footerText: s.footerText || "",
        });
      }
    }
    load();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const payload = {
        ...form,
        heroTitles: form.heroTitlesText
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setFeedback(`Error: ${json.error || "Failed to save settings"}`);
      } else {
        setFeedback("Global settings saved & public pages revalidated!");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell
      title="Global Site, Hero, About & Notification Settings"
      subtitle="Modify every identity element, biography, CTA button, and email notification toggle without source-code edits"
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
        {feedback && (
          <div className="flex items-center gap-2 rounded border border-cyber-green/40 bg-cyber-green/10 p-3 font-mono text-xs text-cyber-green">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Section 1: Hero & Identity */}
        <div className="cyber-card rounded-lg p-6 space-y-4">
          <h2 className="font-mono text-sm font-bold text-cyber-green border-b border-cyber-border pb-2.5">
            01 // HERO SECTION &amp; PROFESSIONAL IDENTITY
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                Hero Name
              </label>
              <input
                type="text"
                value={form.heroName}
                onChange={(e) => setForm({ ...form, heroName: e.target.value })}
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                Status Badge
              </label>
              <input
                type="text"
                value={form.heroBadge}
                onChange={(e) =>
                  setForm({ ...form, heroBadge: e.target.value })
                }
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                Glitch Animation Intensity
              </label>
              <select
                value={form.glitchIntensity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    glitchIntensity: e.target.value as
                      | "OFF"
                      | "LOW"
                      | "MEDIUM"
                      | "HIGH",
                  })
                }
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              >
                <option value="OFF">OFF</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                Rotating Professional Titles (One per line)
              </label>
              <textarea
                rows={4}
                value={form.heroTitlesText}
                onChange={(e) =>
                  setForm({ ...form, heroTitlesText: e.target.value })
                }
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                Hero Introduction Paragraph
              </label>
              <textarea
                rows={4}
                value={form.heroBio}
                onChange={(e) => setForm({ ...form, heroBio: e.target.value })}
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                Primary CTA Label
              </label>
              <input
                type="text"
                value={form.primaryCtaLabel}
                onChange={(e) =>
                  setForm({ ...form, primaryCtaLabel: e.target.value })
                }
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                Primary CTA URL
              </label>
              <input
                type="text"
                value={form.primaryCtaUrl}
                onChange={(e) =>
                  setForm({ ...form, primaryCtaUrl: e.target.value })
                }
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                Secondary CTA Label
              </label>
              <input
                type="text"
                value={form.secondaryCtaLabel}
                onChange={(e) =>
                  setForm({ ...form, secondaryCtaLabel: e.target.value })
                }
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                CV / Resume File URL
              </label>
              <input
                type="text"
                value={form.cvUrl}
                onChange={(e) => setForm({ ...form, cvUrl: e.target.value })}
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>
          </div>
        </div>

        {/* Section 2: About Me & Career Objective */}
        <div className="cyber-card rounded-lg p-6 space-y-4">
          <h2 className="font-mono text-sm font-bold text-cyber-cyan border-b border-cyber-border pb-2.5">
            02 // ABOUT ME &amp; CAREER OBJECTIVE
          </h2>

          <div>
            <label className="block font-mono text-xs text-cyber-muted mb-1">
              About Biography
            </label>
            <textarea
              rows={4}
              value={form.aboutBio}
              onChange={(e) => setForm({ ...form, aboutBio: e.target.value })}
              className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-cyber-muted mb-1">
              Career Objective (target_obj.txt)
            </label>
            <textarea
              rows={3}
              value={form.careerObjective}
              onChange={(e) =>
                setForm({ ...form, careerObjective: e.target.value })
              }
              className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
            />
          </div>
        </div>

        {/* Section 3: Contact Notification & Emergency Switches */}
        <div className="cyber-card rounded-lg p-6 space-y-4">
          <h2 className="font-mono text-sm font-bold text-cyber-green border-b border-cyber-border pb-2.5">
            03 // CONTACT NOTIFICATION SETTINGS &amp; SYSTEM CONTROLS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="rounded border border-cyber-green/30 bg-cyber-green/10 p-3.5">
              <div className="font-bold text-cyber-green">
                Save Messages in PostgreSQL
              </div>
              <div className="text-cyber-muted mt-1">
                Always ON. Every submission is stored in the Admin Inbox.
              </div>
            </div>

            <label className="rounded border border-cyber-border bg-cyber-black p-3.5 flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.emailNotifications}
                onChange={(e) =>
                  setForm({ ...form, emailNotifications: e.target.checked })
                }
                className="mt-1"
              />
              <div>
                <div className="font-bold text-cyber-cyan">
                  Forward Email Notifications (Resend)
                </div>
                <div className="text-cyber-muted mt-1">
                  Send an instant email alert when a visitor submits the form.
                </div>
              </div>
            </label>

            <label className="rounded border border-cyber-border bg-cyber-black p-3.5 flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.disableAnimations}
                onChange={(e) =>
                  setForm({ ...form, disableAnimations: e.target.checked })
                }
                className="mt-1"
              />
              <div>
                <div className="font-bold text-cyber-amber">
                  Emergency Animation Kill-Switch
                </div>
                <div className="text-cyber-muted mt-1">
                  Disable glitch and scanline animations across the public site.
                </div>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                Public Contact Email
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm({ ...form, contactEmail: e.target.value })
                }
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                Notification Recipient Email
              </label>
              <input
                type="email"
                value={form.notifyEmail}
                onChange={(e) =>
                  setForm({ ...form, notifyEmail: e.target.value })
                }
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                Footer Copyright Text
              </label>
              <input
                type="text"
                value={form.footerText}
                onChange={(e) =>
                  setForm({ ...form, footerText: e.target.value })
                }
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Admin Password Reset */}
        <div className="cyber-card rounded-lg p-6 space-y-4">
          <h2 className="font-mono text-sm font-bold text-cyber-cyan border-b border-cyber-border pb-2.5 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>04 // RESET ADMIN PASSWORD</span>
          </h2>

          {passFeedback && (
            <div className={`p-3 rounded border font-mono text-xs ${
              passFeedback.startsWith("Success")
                ? "border-cyber-green/40 bg-cyber-green/10 text-cyber-green"
                : "border-cyber-red/40 bg-cyber-red/10 text-cyber-red"
            }`}>
              {passFeedback}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                Current Password (Optional if newly initializing)
              </label>
              <input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Enter current password..."
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-muted mb-1">
                New Password (Minimum 6 characters)
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Enter new password..."
                className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={passUpdating || !newPass}
            className="rounded border border-cyber-cyan bg-cyber-cyan/15 px-4 py-2 font-mono text-xs font-bold text-cyber-cyan hover:bg-cyber-cyan/25 disabled:opacity-50"
          >
            {passUpdating ? "Updating Password..." : "Update Admin Password"}
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded border border-cyber-green bg-cyber-green px-6 py-2.5 font-mono text-xs font-bold text-cyber-black hover:bg-cyber-green/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving Settings..." : "Save Global Settings"}</span>
        </button>
      </form>
    </AdminShell>
  );
}

