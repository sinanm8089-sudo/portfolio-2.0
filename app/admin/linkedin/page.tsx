"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import { Plus, Trash2, ExternalLink } from "lucide-react";

interface LinkedInPostItem {
  id: string;
  title: string;
  description: string;
  postUrl: string;
  postDate: string;
  isFeatured: boolean;
  status: string;
}

export default function AdminLinkedInPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<LinkedInPostItem[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    postUrl: "https://www.linkedin.com/in/sinan-mohammed-21b50a380",
    postDate: "2026-11",
    isFeatured: true,
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  async function loadPosts() {
    const res = await fetch("/api/admin/posts");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    if (json.ok) {
      setPosts(json.posts || []);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        displayOrder: posts.length + 1,
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
      description: "",
      postUrl: "https://www.linkedin.com/in/sinan-mohammed-21b50a380",
      postDate: "2026-11",
      isFeatured: true,
    });
    setFeedback("LinkedIn post added to showcase!");
    loadPosts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this LinkedIn post?")) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    loadPosts();
  }

  return (
    <AdminShell
      title="LinkedIn Posts Showcase Management"
      subtitle="Curate LinkedIn posts and original post links without relying on brittle scrapers"
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
            Add LinkedIn Post to Showcase
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              required
              placeholder="Post Title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
            />
            <input
              type="url"
              required
              placeholder="Original LinkedIn Post URL *"
              value={form.postUrl}
              onChange={(e) => setForm({ ...form, postUrl: e.target.value })}
              className="rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
            />
            <input
              type="text"
              required
              placeholder="Post Date (e.g. 2026-11)"
              value={form.postDate}
              onChange={(e) => setForm({ ...form, postDate: e.target.value })}
              className="rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
            />
          </div>

          <textarea
            rows={3}
            required
            placeholder="Post Summary / Excerpt *"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
          />

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded border border-cyber-green bg-cyber-green px-4 py-1.5 font-mono text-xs font-bold text-cyber-black"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Post</span>
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="cyber-card rounded-lg p-5 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-mono text-base font-bold text-cyber-text">
                    {post.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleDelete(post.id)}
                    className="text-cyber-red"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="font-mono text-xs text-cyber-muted mt-1">
                  {post.postDate}
                </div>
                <p className="text-xs text-cyber-muted mt-2">
                  {post.description}
                </p>
              </div>
              <a
                href={post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs text-cyber-cyan hover:underline"
              >
                <span>Open on LinkedIn</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

