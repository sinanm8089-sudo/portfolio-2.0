"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Terminal, AlertTriangle, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("sinan.m8089@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Authentication failed.");
        setLoading(false);
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network error while authenticating.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cyber-black flex flex-col justify-center items-center p-4 cyber-grid-bg">
      <div className="w-full max-w-md cyber-card rounded-lg overflow-hidden">
        <div className="border-b border-cyber-border bg-cyber-panel px-5 py-3 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-cyber-green">
            <Terminal className="h-4 w-4 text-cyber-cyan" />
            <span>auth://portfolio-cms-v2</span>
          </div>
          <span className="text-cyber-muted">BCRYPT + HMAC</span>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-cyber-green font-mono text-xs">
              <Lock className="h-3.5 w-3.5" />
              <span>RESTRICTED COMMAND CENTER</span>
            </div>
            <h1 className="font-mono text-xl font-bold text-cyber-text">
              Administrator Login
            </h1>
            <p className="font-mono text-xs text-cyber-muted">
              Authenticate with your administrator credentials to manage
              Portfolio 2.0.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded border border-cyber-red/50 bg-cyber-red/10 p-3 font-mono text-xs text-cyber-red">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-mono text-xs text-cyber-green mb-1.5">
              &gt; Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-cyber-border bg-cyber-black px-3.5 py-2.5 font-mono text-xs text-cyber-text focus:border-cyber-green focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-cyber-green mb-1.5">
              &gt; Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password..."
              className="w-full rounded border border-cyber-border bg-cyber-black px-3.5 py-2.5 font-mono text-xs text-cyber-text focus:border-cyber-green focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded border border-cyber-green bg-cyber-green py-2.5 font-mono text-xs font-bold text-cyber-black hover:bg-cyber-green/90 disabled:opacity-50 transition-all"
          >
            {loading ? "> VERIFYING CREDENTIALS..." : "> AUTHENTICATE SESSION"}
          </button>

          <div className="pt-2 border-t border-cyber-border flex items-center justify-between font-mono text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-cyber-muted hover:text-cyber-cyan"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Public Portfolio</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

