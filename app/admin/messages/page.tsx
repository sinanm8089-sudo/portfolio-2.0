"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import {
  Mail,
  Send,
  Trash2,
  Archive,
  CheckCircle2,
  Search,
} from "lucide-react";

interface ContactReplyItem {
  id: string;
  adminEmail: string;
  subject: string;
  body: string;
  sentAt: string;
}

interface ContactMessageItem {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  category: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  createdAt: string;
  replies: ContactReplyItem[];
}

export default function AdminMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [selected, setSelected] = useState<ContactMessageItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState<string | null>(null);

  async function loadMessages() {
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());

    const res = await fetch(`/api/admin/messages?${params.toString()}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    if (json.ok) {
      setMessages(json.messages || []);
    }
  }

  useEffect(() => {
    loadMessages();
  }, [statusFilter, searchQuery]);

  async function handleSelectMessage(msg: ContactMessageItem) {
    setSelected(msg);
    setReplySubject(`Re: ${msg.subject}`);
    setReplyBody("");
    setReplyFeedback(null);

    if (msg.status === "NEW") {
      await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, status: "READ" }),
      });
      loadMessages();
    }
  }

  async function handleStatusChange(
    id: string,
    status: "NEW" | "READ" | "REPLIED" | "ARCHIVED"
  ) {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadMessages();
    if (selected?.id === id) {
      setSelected({ ...selected, status });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this message permanently?")) return;
    await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
    setSelected(null);
    loadMessages();
  }

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSendingReply(true);
    setReplyFeedback(null);

    try {
      const res = await fetch(`/api/admin/messages/${selected.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: replySubject,
          body: replyBody,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setReplyFeedback(`Error: ${json.error || "Failed to send reply"}`);
        setSendingReply(false);
        return;
      }

      setReplyBody("");
      setSelected(json.message);
      setReplyFeedback(
        json.emailDelivered
          ? "Reply sent via Resend & logged in PostgreSQL!"
          : `Reply saved to PostgreSQL! (${json.emailNotice || "Set RESEND_API_KEY for live email delivery"})`
      );
      loadMessages();
    } finally {
      setSendingReply(false);
    }
  }

  return (
    <AdminShell
      title="Contact Inbox & Direct Reply System"
      subtitle="Read visitor inquiries, manage message status, and send direct email replies via Resend"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inbox List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="cyber-card rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 rounded border border-cyber-border bg-cyber-black px-3 py-2">
              <Search className="h-4 w-4 text-cyber-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sender, email, subject..."
                className="w-full bg-transparent font-mono text-xs text-cyber-text focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {["ALL", "NEW", "READ", "REPLIED", "ARCHIVED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`rounded px-2.5 py-1 font-mono text-[11px] border ${
                    statusFilter === st
                      ? "border-cyber-green bg-cyber-green text-cyber-black font-bold"
                      : "border-cyber-border bg-cyber-black text-cyber-muted"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {messages.length === 0 ? (
              <div className="cyber-card rounded-lg p-6 text-center font-mono text-xs text-cyber-muted">
                No contact messages matching current filter.
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleSelectMessage(m)}
                  className={`cyber-card rounded-lg p-4 cursor-pointer transition-all ${
                    selected?.id === m.id
                      ? "border-cyber-green shadow-neon"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-cyber-text">
                      {m.senderName}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] border ${
                        m.status === "NEW"
                          ? "border-cyber-green bg-cyber-green/15 text-cyber-green font-bold"
                          : m.status === "REPLIED"
                          ? "border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan"
                          : "border-cyber-border text-cyber-muted"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-cyber-muted">
                    {m.senderEmail}
                  </div>
                  <div className="font-mono text-xs text-cyber-green mt-1.5 truncate">
                    {m.subject}
                  </div>
                  <p className="text-xs text-cyber-muted line-clamp-2 mt-1">
                    {m.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Message Detail & Reply Editor */}
        <div className="lg:col-span-7">
          {!selected ? (
            <div className="cyber-card rounded-lg p-12 text-center space-y-2">
              <Mail className="h-8 w-8 text-cyber-muted mx-auto" />
              <div className="font-mono text-sm text-cyber-muted">
                Select a message from the inbox to read and reply.
              </div>
            </div>
          ) : (
            <div className="cyber-card rounded-lg p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-cyber-border pb-4">
                <div>
                  <h2 className="font-mono text-lg font-bold text-cyber-text">
                    {selected.subject}
                  </h2>
                  <div className="font-mono text-xs text-cyber-cyan mt-1">
                    From: {selected.senderName} &lt;{selected.senderEmail}&gt;
                  </div>
                  <div className="font-mono text-[11px] text-cyber-muted mt-0.5">
                    Category: {selected.category} · Received:{" "}
                    {new Date(selected.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      handleStatusChange(
                        selected.id,
                        selected.status === "NEW" ? "READ" : "NEW"
                      )
                    }
                    className="rounded border border-cyber-border bg-cyber-panel px-2.5 py-1 text-cyber-text hover:border-cyber-green"
                  >
                    Mark {selected.status === "NEW" ? "Read" : "Unread"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selected.id, "ARCHIVED")}
                    className="rounded border border-cyber-border bg-cyber-panel px-2.5 py-1 text-cyber-muted hover:text-cyber-amber"
                    title="Archive"
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selected.id)}
                    className="rounded border border-cyber-red/30 bg-cyber-red/10 px-2.5 py-1 text-cyber-red"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="rounded border border-cyber-border bg-cyber-black/80 p-4 font-mono text-xs sm:text-sm text-cyber-text whitespace-pre-wrap leading-relaxed">
                {selected.message}
              </div>

              {/* Previous Replies */}
              {selected.replies && selected.replies.length > 0 && (
                <div className="space-y-3">
                  <div className="font-mono text-xs font-bold text-cyber-cyan">
                    &gt; REPLY HISTORY ({selected.replies.length})
                  </div>
                  {selected.replies.map((rep) => (
                    <div
                      key={rep.id}
                      className="rounded border border-cyber-cyan/30 bg-cyber-cyan/5 p-3.5 space-y-1 font-mono text-xs"
                    >
                      <div className="flex justify-between text-cyber-cyan">
                        <span>{rep.subject}</span>
                        <span>{new Date(rep.sentAt).toLocaleString()}</span>
                      </div>
                      <p className="text-cyber-text whitespace-pre-wrap pt-1">
                        {rep.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Direct Reply Editor */}
              <form
                onSubmit={handleSendReply}
                className="border-t border-cyber-border pt-5 space-y-4"
              >
                <div className="font-mono text-xs font-bold text-cyber-green">
                  &gt; COMPOSE DIRECT EMAIL REPLY (RESEND + POSTGRESQL)
                </div>

                <div>
                  <label className="block font-mono text-xs text-cyber-muted mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-cyber-muted mb-1">
                    Reply Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder={`Write your response to ${selected.senderName}...`}
                    className="w-full rounded border border-cyber-border bg-cyber-black px-3 py-2 font-mono text-xs text-cyber-text"
                  />
                </div>

                {replyFeedback && (
                  <div className="flex items-center gap-2 rounded border border-cyber-green/40 bg-cyber-green/10 p-3 font-mono text-xs text-cyber-green">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{replyFeedback}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sendingReply}
                  className="inline-flex items-center gap-2 rounded border border-cyber-green bg-cyber-green px-5 py-2 font-mono text-xs font-bold text-cyber-black hover:bg-cyber-green/90 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {sendingReply ? "Sending Reply..." : "Send Direct Reply"}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

