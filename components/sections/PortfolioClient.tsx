"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Shield,
  Terminal,
  Code,
  Cpu,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Award,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Download,
  Lock,
  Layers,
  GraduationCap,
  Briefcase,
  Sparkles,
  Menu,
} from "lucide-react";
import SceneGate from "@/components/three/SceneGate";

interface PortfolioDataProps {
  data: {
    dbConnected: boolean;
    site: {
      siteName: string;
      heroBadge: string;
      heroGreeting: string;
      heroName: string;
      heroTitles: string[];
      heroBio: string;
      cvUrl?: string | null;
      primaryCtaLabel: string;
      primaryCtaUrl: string;
      secondaryCtaLabel: string;
      secondaryCtaUrl: string;
      glitchIntensity: string;
      showStats: boolean;
      aboutHeading: string;
      aboutBio: string;
      careerObjective: string;
      location: string;
      contactEmail: string;
      disableAnimations: boolean;
      footerText: string;
    };
    scene?: {
      isEnabled: boolean;
      preset: string;
      primaryColor: string;
      secondaryColor: string;
      particleDensity: number;
      animationSpeed: number;
    };
    navigation: Array<{
      id: string;
      label: string;
      href: string;
      isExternal: boolean;
    }>;
    socialLinks: Array<{
      id: string;
      platform: string;
      label: string;
      url: string;
      icon: string;
    }>;
    skillCategories: Array<{
      id: string;
      name: string;
      slug: string;
      icon: string;
      terminalHeader: string;
      skills: Array<{
        id: string;
        name: string;
        commandLabel?: string | null;
        proficiency: number;
        isFeatured: boolean;
      }>;
    }>;
    projects: Array<{
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
    }>;
    education: Array<{
      id: string;
      degree: string;
      institution: string;
      university?: string | null;
      location?: string | null;
      startYear: string;
      endYear?: string | null;
      description?: string | null;
      grade?: string | null;
    }>;
    experience: Array<{
      id: string;
      title: string;
      organization: string;
      location?: string | null;
      type: string;
      startDate: string;
      endDate?: string | null;
      description: string;
      highlights: string[];
    }>;
    certifications: Array<{
      id: string;
      title: string;
      organization: string;
      issueDate: string;
      credentialId?: string | null;
      verifyUrl?: string | null;
      fileUrl?: string | null;
      description?: string | null;
    }>;
    linkedInPosts: Array<{
      id: string;
      title: string;
      description: string;
      postUrl: string;
      imageUrl?: string | null;
      postDate: string;
      isFeatured: boolean;
    }>;
  };
}

export default function PortfolioClient({ data }: PortfolioDataProps) {
  const {
    site,
    navigation,
    socialLinks,
    skillCategories,
    projects,
    education,
    experience,
    certifications,
    linkedInPosts,
  } = data;

  // Typewriter rotating titles
  const [titleIndex, setTitleIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Project filter & modal state
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeProject, setActiveProject] = useState<
    PortfolioDataProps["data"]["projects"][0] | null
  >(null);

  // LinkedIn post popup state
  const [activePost, setActivePost] = useState<
    PortfolioDataProps["data"]["linkedInPosts"][0] | null
  >(null);

  // Terminal search modal state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Contact form state
  const [contactForm, setContactForm] = useState({
    senderName: "",
    senderEmail: "",
    subject: "",
    category: "General",
    message: "",
    honeypot: "",
  });
  const [contactState, setContactState] = useState<{
    submitting: boolean;
    success: boolean;
    error: string | null;
  }>({ submitting: false, success: false, error: null });

  useEffect(() => {
    if (!site.heroTitles || site.heroTitles.length <= 1) return;
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % site.heroTitles.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [site.heroTitles]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setActiveProject(null);
        setActivePost(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const projectCategories = useMemo(() => {
    const cats = new Set<string>(["ALL"]);
    projects.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "ALL") return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  const totalSkillsCount = useMemo(
    () => skillCategories.reduce((acc, cat) => acc + cat.skills.length, 0),
    [skillCategories]
  );

  // Instant Terminal Search results
  const searchResults = useMemo(() => {
    const raw = searchQuery.trim().toLowerCase();
    if (!raw) return [];

    if (raw === "help") {
      return [
        {
          type: "CMD",
          title: "Available Terminal Commands",
          subtitle: "Type: projects | skills | certs | about | contact | clear",
          href: "#home",
        },
      ];
    }

    const matches: Array<{
      type: string;
      title: string;
      subtitle: string;
      href: string;
      onSelect?: () => void;
    }> = [];

    projects.forEach((p) => {
      const hay = `${p.title} ${p.summary} ${p.description} ${p.techStack.join(" ")} ${p.category}`.toLowerCase();
      if (hay.includes(raw) || raw === "projects") {
        matches.push({
          type: "PROJECT",
          title: p.title,
          subtitle: p.summary,
          href: "#projects",
          onSelect: () => setActiveProject(p),
        });
      }
    });

    skillCategories.forEach((c) => {
      c.skills.forEach((s) => {
        const hay = `${s.name} ${c.name} ${s.commandLabel || ""}`.toLowerCase();
        if (hay.includes(raw) || raw === "skills") {
          matches.push({
            type: "SKILL",
            title: s.name,
            subtitle: c.name,
            href: "#skills",
          });
        }
      });
    });

    certifications.forEach((cert) => {
      const hay = `${cert.title} ${cert.organization} ${cert.description || ""}`.toLowerCase();
      if (hay.includes(raw) || raw === "certs" || raw === "certifications") {
        matches.push({
          type: "CERT",
          title: cert.title,
          subtitle: `${cert.organization} (${cert.issueDate})`,
          href: "#certifications",
        });
      }
    });

    linkedInPosts.forEach((post) => {
      const hay = `${post.title} ${post.description}`.toLowerCase();
      if (hay.includes(raw) || raw === "linkedin") {
        matches.push({
          type: "LINKEDIN",
          title: post.title,
          subtitle: post.description.slice(0, 90) + "...",
          href: "#linkedin",
          onSelect: () => setActivePost(post),
        });
      }
    });

    return matches.slice(0, 12);
  }, [searchQuery, projects, skillCategories, certifications, linkedInPosts]);

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactState({ submitting: true, success: false, error: null });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setContactState({
          submitting: false,
          success: false,
          error: json.error || "Transmission failed.",
        });
        return;
      }

      setContactState({ submitting: false, success: true, error: null });
      setContactForm({
        senderName: "",
        senderEmail: "",
        subject: "",
        category: "General",
        message: "",
        honeypot: "",
      });
    } catch {
      setContactState({
        submitting: false,
        success: false,
        error: "Network error while transmitting packet.",
      });
    }
  }

  return (
    <div className="relative min-h-screen bg-cyber-black text-cyber-text cyber-grid-bg">
      {/* Full-Screen 3D Cybersecurity Background from sinanm8089-sudo.github.io */}
      <SceneGate
        isEnabled={data.scene?.isEnabled ?? true}
        disableAnimations={site.disableAnimations}
        preset={data.scene?.preset}
        particleDensity={data.scene?.particleDensity}
        animationSpeed={data.scene?.animationSpeed}
        primaryColor={data.scene?.primaryColor || "#00ff00"}
        secondaryColor="#ff003c"
      />

      {/* Subtle Scanlines Overlay */}
      {!site.disableAnimations && (
        <div className="pointer-events-none fixed inset-0 z-40 cyber-scanlines opacity-30" />
      )}

      {/* Ambient Top Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 h-[420px] w-[900px] rounded-full bg-cyber-green/5 blur-[150px]" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-cyber-green/20 bg-cyber-black/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <a
            href="#home"
            className="font-mono text-sm sm:text-base font-semibold tracking-tight text-cyber-green flex items-center gap-1.5"
          >
            <Terminal className="h-4 w-4 text-cyber-cyan" />
            <span>root@sinan:~#</span>
            <span className="animate-cursor text-cyber-cyan">_</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-5">
            {navigation.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="font-mono text-xs tracking-wider text-cyber-muted hover:text-cyber-green transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Terminal Search Trigger & Admin Button */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded border border-cyber-green/30 bg-cyber-surface/90 px-3 py-1.5 font-mono text-xs text-cyber-muted hover:border-cyber-green hover:text-cyber-green transition-all"
              aria-label="Open terminal search"
            >
              <Search className="h-3.5 w-3.5 text-cyber-green" />
              <span className="hidden sm:inline">search &gt;</span>
              <kbd className="hidden md:inline-block rounded bg-cyber-black px-1.5 py-0.5 text-[10px] text-cyber-cyan border border-cyber-border">
                Ctrl+K
              </kbd>
            </button>

            <Link
              href="/admin/dashboard"
              className="rounded border border-cyber-cyan/40 bg-cyber-cyan/10 px-3 py-1.5 font-mono text-xs font-medium text-cyber-cyan hover:bg-cyber-cyan/20 transition-all"
            >
              [ CMS ]
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((p) => !p)}
              className="lg:hidden rounded border border-cyber-border p-1.5 text-cyber-green"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-cyber-border bg-cyber-surface px-4 py-3 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 font-mono text-xs text-cyber-text hover:text-cyber-green"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* MODULE 01: HERO SECTION */}
        <section
          id="home"
          className="relative py-16 sm:py-24 lg:py-28 border-b border-cyber-border/60"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyber-green/35 bg-cyber-green/10 px-3.5 py-1 font-mono text-xs text-cyber-green">
                <span className="h-2 w-2 rounded-full bg-cyber-green animate-pulse" />
                {site.heroBadge}
              </div>

              <div className="space-y-2">
                <p className="font-mono text-xs sm:text-sm text-cyber-cyan">
                  {site.heroGreeting}
                </p>
                <h1
                  data-text={site.heroName}
                  className={`text-4xl sm:text-6xl font-extrabold tracking-tight text-cyber-text ${
                    site.glitchIntensity !== "OFF" && !site.disableAnimations
                      ? "glitch-title"
                      : ""
                  }`}
                >
                  {site.heroName}
                </h1>
                <div className="flex items-center gap-2 pt-1 font-mono text-lg sm:text-2xl font-semibold text-cyber-green">
                  <span>&gt;</span>
                  <span>
                    {site.heroTitles[titleIndex] ||
                      "Cybersecurity Student & Developer"}
                  </span>
                  <span className="animate-cursor text-cyber-cyan">_</span>
                </div>
              </div>

              <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-cyber-muted font-mono">
                {site.heroBio}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href={site.primaryCtaUrl}
                  className="rounded border border-cyber-green bg-cyber-green px-5 py-2.5 font-mono text-xs sm:text-sm font-bold text-cyber-black shadow-neon hover:bg-cyber-green/90 transition-all"
                >
                  {site.primaryCtaLabel}
                </a>
                <a
                  href={site.secondaryCtaUrl}
                  className="rounded border border-cyber-cyan/50 bg-cyber-surface px-5 py-2.5 font-mono text-xs sm:text-sm font-semibold text-cyber-cyan hover:border-cyber-cyan hover:bg-cyber-cyan/10 transition-all"
                >
                  {site.secondaryCtaLabel}
                </a>
                {site.cvUrl && (
                  <a
                    href={site.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded border border-cyber-border bg-cyber-panel px-4 py-2.5 font-mono text-xs sm:text-sm text-cyber-text hover:border-cyber-green/50 hover:text-cyber-green transition-all"
                  >
                    <Download className="h-4 w-4 text-cyber-green" />
                    <span>Download CV / Cert</span>
                  </a>
                )}
              </div>

              {/* Social Links Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {socialLinks.map((soc) => (
                  <a
                    key={soc.id}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded border border-cyber-border bg-cyber-surface/80 px-3 py-1.5 font-mono text-xs text-cyber-muted hover:border-cyber-green/40 hover:text-cyber-green transition-all"
                  >
                    {soc.platform.toLowerCase().includes("github") ? (
                      <Github className="h-3.5 w-3.5 text-cyber-green" />
                    ) : soc.platform.toLowerCase().includes("linkedin") ? (
                      <Linkedin className="h-3.5 w-3.5 text-cyber-cyan" />
                    ) : (
                      <Mail className="h-3.5 w-3.5 text-cyber-green" />
                    )}
                    <span>{soc.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Interactive Cyber Telemetry HUD Card */}
            <div className="lg:col-span-5">
              <div className="cyber-card rounded-lg overflow-hidden">
                <div className="flex items-center justify-between border-b border-cyber-border bg-cyber-panel px-4 py-2.5 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyber-red/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-cyber-amber/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-cyber-green/80" />
                    <span className="ml-2 text-cyber-muted">
                      telemetry://command-node-01
                    </span>
                  </div>
                  <span className="text-cyber-green">ENCRYPTED</span>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-cyber-border/60 pb-4">
                    <div>
                      <div className="font-mono text-xs text-cyber-muted">
                        IDENTITY NODE
                      </div>
                      <div className="font-mono text-sm font-bold text-cyber-green">
                        SINAN_MOHAMMED // SEC-OPS
                      </div>
                    </div>
                    <Shield className="h-8 w-8 text-cyber-cyan" />
                  </div>

                  {/* Stats Grid */}
                  {site.showStats && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded border border-cyber-border bg-cyber-black/60 p-3 text-center">
                        <div className="font-mono text-2xl font-bold text-cyber-green">
                          {projects.length}+
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-cyber-muted">
                          Projects
                        </div>
                      </div>
                      <div className="rounded border border-cyber-border bg-cyber-black/60 p-3 text-center">
                        <div className="font-mono text-2xl font-bold text-cyber-cyan">
                          {totalSkillsCount}+
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-cyber-muted">
                          Tech Skills
                        </div>
                      </div>
                      <div className="rounded border border-cyber-border bg-cyber-black/60 p-3 text-center">
                        <div className="font-mono text-2xl font-bold text-cyber-green">
                          {certifications.length}+
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-cyber-muted">
                          Verified Certs
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Terminal Quick Search Input inside Hero HUD */}
                  <div className="rounded border border-cyber-green/30 bg-cyber-black p-3 font-mono text-xs space-y-2">
                    <div className="text-cyber-muted">
                      root@sinan-portfolio:~$ <span className="text-cyber-green">status --all</span>
                    </div>
                    <div className="text-cyber-text/90 space-y-1">
                      <div>
                        <span className="text-cyber-cyan">[FOCUS]</span> Ethical Hacking · Pentesting · AI Security
                      </div>
                      <div>
                        <span className="text-cyber-cyan">[STACK]</span> Next.js · TypeScript · Python · C · PostgreSQL
                      </div>
                      <div>
                        <span className="text-cyber-cyan">[LOC]</span> {site.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MODULE 03: ABOUT ME */}
        <section
          id="about"
          className="py-16 sm:py-20 border-b border-cyber-border/60"
        >
          <div className="mb-10">
            <h2 className="font-mono text-2xl sm:text-3xl font-bold text-cyber-green flex items-center gap-2">
              <span>root@sinan:~/whoami$</span>
              <span className="animate-cursor text-cyber-cyan">_</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="cyber-card rounded-lg p-6 space-y-4">
                <h3 className="font-mono text-lg font-semibold text-cyber-cyan">
                  {site.aboutHeading}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-cyber-text/90">
                  {site.aboutBio}
                </p>
              </div>

              <div className="cyber-card rounded-lg p-6 space-y-3 border-l-4 border-l-cyber-green">
                <div className="font-mono text-xs uppercase tracking-wider text-cyber-green">
                  &gt; TARGET CAREER OBJECTIVE // target_obj.txt
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-cyber-muted">
                  {site.careerObjective}
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="cyber-card rounded-lg overflow-hidden h-full">
                <div className="flex items-center justify-between border-b border-cyber-border bg-cyber-panel px-4 py-2.5 font-mono text-xs">
                  <span className="text-cyber-muted">nano sinan.config</span>
                  <span className="text-cyber-cyan">READ-ONLY</span>
                </div>
                <pre className="p-5 font-mono text-xs sm:text-sm leading-relaxed text-cyber-text overflow-x-auto">
                  <code>{`user_profile = {
  "name": "${site.heroName}",
  "role": "Cybersecurity & Full-Stack Developer",
  "university": "KTU (B.Tech Cyber Security)",
  "domains": [
    "Penetration Testing",
    "Vulnerability Analysis",
    "AI-Assisted Defense",
    "Full-Stack Engineering"
  ],
  "location": "${site.location}",
  "cms_engine": "PostgreSQL + Prisma ORM",
  "status": "ACTIVE"
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* MODULE 04: SKILLS & TECHNOLOGIES */}
        <section
          id="skills"
          className="py-16 sm:py-20 border-b border-cyber-border/60"
        >
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-mono text-2xl sm:text-3xl font-bold text-cyber-green flex items-center gap-2">
                <span>root@sinan:~/skills$</span>
                <span className="animate-cursor text-cyber-cyan">_</span>
              </h2>
              <p className="mt-1 font-mono text-xs text-cyber-muted">
                &gt; Dynamically loaded from PostgreSQL skill matrices
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillCategories.map((category) => (
              <div
                key={category.id}
                className="cyber-card rounded-lg overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-cyber-border bg-cyber-panel px-4 py-2.5 font-mono text-xs">
                  <span className="text-cyber-green">
                    {category.terminalHeader || "bin/module.sh"}
                  </span>
                  <span className="text-cyber-muted">
                    {category.skills.length} modules
                  </span>
                </div>

                <div className="p-6 space-y-5 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="rounded border border-cyber-green/30 bg-cyber-green/10 p-2 text-cyber-green">
                      {category.slug.includes("prog") ? (
                        <Code className="h-5 w-5" />
                      ) : category.slug.includes("sec") ? (
                        <Shield className="h-5 w-5" />
                      ) : (
                        <Cpu className="h-5 w-5" />
                      )}
                    </div>
                    <h3 className="font-mono text-base font-bold text-cyber-text">
                      [{category.name.toUpperCase()}]
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {category.skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="rounded border border-cyber-border bg-cyber-black/60 px-3 py-2 space-y-0.5 hover:border-cyber-green/40 transition-colors"
                      >
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-cyber-green">&gt;</span>
                          <span className="text-cyber-text font-medium">
                            {skill.name}
                          </span>
                        </div>
                        {skill.commandLabel && (
                          <div className="pl-4 font-mono text-[11px] text-cyber-muted">
                            {skill.commandLabel}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MODULE 05: PROJECTS SHOWCASE */}
        <section
          id="projects"
          className="py-16 sm:py-20 border-b border-cyber-border/60"
        >
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-mono text-2xl sm:text-3xl font-bold text-cyber-green flex items-center gap-2">
                <span>root@sinan:~/projects$ ls -la</span>
                <span className="animate-cursor text-cyber-cyan">_</span>
              </h2>
              <p className="mt-1.5 font-mono text-xs text-cyber-green">
                &gt; [SYS.GIT: SYNCED {projects.length} REPOSITORIES FROM @sinanm8089-sudo]
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {projectCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded border px-3 py-1 font-mono text-xs transition-all ${
                    selectedCategory === cat
                      ? "border-cyber-green bg-cyber-green text-cyber-black font-bold"
                      : "border-cyber-border bg-cyber-surface text-cyber-muted hover:border-cyber-green/50 hover:text-cyber-text"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="cyber-card rounded-lg overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-cyber-border bg-cyber-panel px-4 py-2.5 font-mono text-xs">
                    <span className="text-cyber-green truncate">
                      drwxr-xr-x {project.slug}
                    </span>
                    {project.isFeatured && (
                      <span className="rounded bg-cyber-green/15 px-2 py-0.5 text-[10px] text-cyber-green border border-cyber-green/30">
                        FEATURED
                      </span>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-mono text-lg font-bold text-cyber-text group-hover:text-cyber-green transition-colors">
                        {project.title}
                      </h3>
                      <span className="rounded border border-cyber-cyan/30 bg-cyber-cyan/10 px-2 py-0.5 font-mono text-[10px] text-cyber-cyan shrink-0">
                        {project.category}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-cyber-muted leading-relaxed">
                      &gt; {project.summary}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded border border-cyber-border bg-cyber-black/70 px-2 py-0.5 font-mono text-[11px] text-cyber-green"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-cyber-border/60 bg-cyber-panel/50 px-6 py-3.5 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveProject(project)}
                    className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-cyber-cyan hover:text-cyber-green transition-colors"
                  >
                    <span>[ INSPECT ]</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-center gap-3">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyber-muted hover:text-cyber-green transition-colors"
                        title="GitHub Repository"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyber-muted hover:text-cyber-cyan transition-colors"
                        title="Live Demo"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MODULE 06: EXPERIENCE & EDUCATION */}
        <section
          id="experience"
          className="py-16 sm:py-20 border-b border-cyber-border/60"
        >
          <div className="mb-10">
            <h2 className="font-mono text-2xl sm:text-3xl font-bold text-cyber-green flex items-center gap-2">
              <span>root@sinan:~/timeline$ history</span>
              <span className="animate-cursor text-cyber-cyan">_</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Experience Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-cyber-cyan uppercase tracking-wider">
                <Briefcase className="h-4 w-4" />
                <span>Experience &amp; Technical Achievements</span>
              </div>

              {experience.map((exp) => (
                <div key={exp.id} className="cyber-card rounded-lg p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded bg-cyber-green/10 border border-cyber-green/30 px-2.5 py-0.5 font-mono text-xs text-cyber-green">
                      {exp.startDate} — {exp.endDate || "Present"}
                    </span>
                    <span className="font-mono text-xs text-cyber-cyan">
                      [{exp.type.toUpperCase()}]
                    </span>
                  </div>
                  <h3 className="font-mono text-base font-bold text-cyber-text">
                    {exp.title}
                  </h3>
                  <div className="font-mono text-xs text-cyber-muted">
                    {exp.organization} {exp.location ? `· ${exp.location}` : ""}
                  </div>
                  <p className="text-xs sm:text-sm text-cyber-text/90 leading-relaxed">
                    {exp.description}
                  </p>
                  {exp.highlights.length > 0 && (
                    <ul className="space-y-1 pt-1 font-mono text-xs text-cyber-muted">
                      {exp.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-cyber-green">&gt;</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Education Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-cyber-green uppercase tracking-wider">
                <GraduationCap className="h-4 w-4" />
                <span>Academic Foundation</span>
              </div>

              {education.map((edu) => (
                <div key={edu.id} className="cyber-card rounded-lg p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded bg-cyber-cyan/10 border border-cyber-cyan/30 px-2.5 py-0.5 font-mono text-xs text-cyber-cyan">
                      {edu.startYear} — {edu.endYear || "Present"}
                    </span>
                    {edu.grade && (
                      <span className="font-mono text-xs text-cyber-green">
                        {edu.grade}
                      </span>
                    )}
                  </div>
                  <h3 className="font-mono text-base font-bold text-cyber-text">
                    {edu.degree}
                  </h3>
                  <div className="font-mono text-xs text-cyber-muted">
                    {edu.institution} {edu.location ? `· ${edu.location}` : ""}
                  </div>
                  {edu.description && (
                    <p className="text-xs sm:text-sm text-cyber-text/90 leading-relaxed">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MODULE 07: CERTIFICATIONS */}
        <section
          id="certifications"
          className="py-16 sm:py-20 border-b border-cyber-border/60"
        >
          <div className="mb-10">
            <h2 className="font-mono text-2xl sm:text-3xl font-bold text-cyber-green flex items-center gap-2">
              <span>root@sinan:~/certs$ ls -la</span>
              <span className="animate-cursor text-cyber-cyan">_</span>
            </h2>
            <p className="mt-1 font-mono text-xs text-cyber-muted">
              &gt; Verified cybersecurity credentials &amp; competition awards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="cyber-card rounded-lg p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Award className="h-6 w-6 text-cyber-green" />
                    <span className="font-mono text-xs text-cyber-cyan">
                      {cert.issueDate}
                    </span>
                  </div>
                  <h3 className="font-mono text-base font-bold text-cyber-text">
                    {cert.title}
                  </h3>
                  <div className="font-mono text-xs text-cyber-muted">
                    {cert.organization}
                  </div>
                  {cert.credentialId && (
                    <div className="font-mono text-[11px] text-cyber-green/80">
                      ID: {cert.credentialId}
                    </div>
                  )}
                  {cert.description && (
                    <p className="text-xs text-cyber-muted leading-relaxed">
                      &gt; {cert.description}
                    </p>
                  )}
                </div>

                {(cert.fileUrl || cert.verifyUrl) && (
                  <a
                    href={cert.fileUrl || cert.verifyUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-cyber-green hover:text-cyber-cyan transition-colors pt-2"
                  >
                    <span>&gt; cat credential.pdf</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* MODULE 08: LINKEDIN POSTS SHOWCASE */}
        <section
          id="linkedin"
          className="py-16 sm:py-20 border-b border-cyber-border/60"
        >
          <div className="mb-10">
            <h2 className="font-mono text-2xl sm:text-3xl font-bold text-cyber-green flex items-center gap-2">
              <span>root@sinan:~/linkedin$ feed --featured</span>
              <span className="animate-cursor text-cyber-cyan">_</span>
            </h2>
            <p className="mt-1 font-mono text-xs text-cyber-muted">
              &gt; Curated professional insights and cybersecurity dispatches
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {linkedInPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setActivePost(post)}
                className="cyber-card rounded-lg p-6 cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="inline-flex items-center gap-1.5 text-cyber-cyan">
                    <Linkedin className="h-4 w-4" />
                    <span>LINKEDIN DISPATCH</span>
                  </span>
                  <span className="text-cyber-muted">{post.postDate}</span>
                </div>
                <h3 className="font-mono text-base font-bold text-cyber-text group-hover:text-cyber-green transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs sm:text-sm text-cyber-muted line-clamp-3 leading-relaxed">
                  {post.description}
                </p>
                <div className="pt-2 font-mono text-xs text-cyber-green flex items-center gap-1">
                  <span>[ OPEN DISPATCH MODAL ]</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MODULE 10: CONTACT US */}
        <section id="contact" className="py-16 sm:py-24">
          <div className="mb-10">
            <h2 className="font-mono text-2xl sm:text-3xl font-bold text-cyber-green flex items-center gap-2">
              <span>root@sinan:~/network$ ping -c 4</span>
              <span className="animate-cursor text-cyber-cyan">_</span>
            </h2>
            <p className="mt-1 font-mono text-xs text-cyber-muted">
              &gt; Establish an encrypted transmission straight to PostgreSQL Contact Inbox
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
              <div className="cyber-card rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-cyber-green" />
                  <div>
                    <div className="font-mono text-xs text-cyber-muted">
                      [ PORT 25: DIRECT EMAIL ]
                    </div>
                    <a
                      href={`mailto:${site.contactEmail}`}
                      className="font-mono text-sm text-cyber-text hover:text-cyber-green"
                    >
                      {site.contactEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-cyber-cyan" />
                  <div>
                    <div className="font-mono text-xs text-cyber-muted">
                      [ GEO-IP LOCATION ]
                    </div>
                    <div className="font-mono text-sm text-cyber-text">
                      {site.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <form
                onSubmit={handleContactSubmit}
                className="cyber-card rounded-lg overflow-hidden"
              >
                <div className="border-b border-cyber-border bg-cyber-panel px-4 py-2.5 font-mono text-xs text-cyber-muted flex justify-between">
                  <span>/dev/tcp/contact-socket</span>
                  <span className="text-cyber-green">TLS 1.3</span>
                </div>

                <div className="p-6 space-y-4">
                  {/* Honeypot field */}
                  <input
                    type="text"
                    name="honeypot"
                    value={contactForm.honeypot}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, honeypot: e.target.value })
                    }
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-cyber-green mb-1.5">
                        &gt; alias (Full Name) *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.senderName}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            senderName: e.target.value,
                          })
                        }
                        placeholder="Visitor / Recruiter"
                        className="w-full rounded border border-cyber-border bg-cyber-black px-3.5 py-2 font-mono text-xs text-cyber-text focus:border-cyber-green focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-cyber-green mb-1.5">
                        &gt; return_addr (Email) *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.senderEmail}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            senderEmail: e.target.value,
                          })
                        }
                        placeholder="you@domain.com"
                        className="w-full rounded border border-cyber-border bg-cyber-black px-3.5 py-2 font-mono text-xs text-cyber-text focus:border-cyber-green focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-cyber-green mb-1.5">
                        &gt; subject *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.subject}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            subject: e.target.value,
                          })
                        }
                        placeholder="Security Project / Hiring Inquiry"
                        className="w-full rounded border border-cyber-border bg-cyber-black px-3.5 py-2 font-mono text-xs text-cyber-text focus:border-cyber-green focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-cyber-green mb-1.5">
                        &gt; category
                      </label>
                      <select
                        value={contactForm.category}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            category: e.target.value,
                          })
                        }
                        className="w-full rounded border border-cyber-border bg-cyber-black px-3.5 py-2 font-mono text-xs text-cyber-text focus:border-cyber-green focus:outline-none"
                      >
                        <option value="General">General Inquiry</option>
                        <option value="Cybersecurity">Cybersecurity / Audit</option>
                        <option value="Project Collaboration">
                          Project Collaboration
                        </option>
                        <option value="Job Opportunity">Job Opportunity</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-cyber-green mb-1.5">
                      &gt; payload (Message) *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          message: e.target.value,
                        })
                      }
                      placeholder="Enter transmission payload..."
                      className="w-full rounded border border-cyber-border bg-cyber-black px-3.5 py-2 font-mono text-xs text-cyber-text focus:border-cyber-green focus:outline-none"
                    />
                  </div>

                  {contactState.error && (
                    <div className="flex items-center gap-2 rounded border border-cyber-red/50 bg-cyber-red/10 p-3 font-mono text-xs text-cyber-red">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{contactState.error}</span>
                    </div>
                  )}

                  {contactState.success && (
                    <div className="flex items-center gap-2 rounded border border-cyber-green/50 bg-cyber-green/10 p-3 font-mono text-xs text-cyber-green">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        [OK] PACKET DELIVERED — Message saved in PostgreSQL Inbox.
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={contactState.submitting}
                    className="w-full sm:w-auto rounded border border-cyber-green bg-cyber-green px-6 py-2.5 font-mono text-xs font-bold text-cyber-black hover:bg-cyber-green/90 disabled:opacity-50 transition-all"
                  >
                    {contactState.submitting
                      ? "> TRANSMITTING PACKET..."
                      : "> ./send_packet.sh"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyber-border bg-cyber-surface/80 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-cyber-muted">
          <div>{site.footerText}</div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-cyber-muted hover:text-cyber-green"
            >
              [ Admin CMS ]
            </Link>
          </div>
        </div>
      </footer>

      {/* PROJECT DETAIL POPUP MODAL */}
      {activeProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setActiveProject(null)}
        >
          <div
            className="cyber-card max-w-2xl w-full rounded-lg overflow-hidden max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-cyber-border bg-cyber-panel px-5 py-3 font-mono text-xs">
              <span className="text-cyber-green">
                inspect://projects/{activeProject.slug}
              </span>
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                className="text-cyber-muted hover:text-cyber-red"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-mono text-2xl font-bold text-cyber-text">
                  {activeProject.title}
                </h3>
                <span className="rounded border border-cyber-cyan/40 bg-cyber-cyan/10 px-2.5 py-0.5 font-mono text-xs text-cyber-cyan">
                  {activeProject.category} · {activeProject.devStatus}
                </span>
              </div>

              <p className="text-sm text-cyber-text/90 leading-relaxed">
                {activeProject.description}
              </p>

              {activeProject.architecture && (
                <div className="rounded border border-cyber-border bg-cyber-black/70 p-4 space-y-1.5">
                  <div className="font-mono text-xs font-bold text-cyber-cyan">
                    &gt; SYSTEM ARCHITECTURE
                  </div>
                  <p className="text-xs sm:text-sm text-cyber-muted leading-relaxed">
                    {activeProject.architecture}
                  </p>
                </div>
              )}

              {activeProject.keyFeatures.length > 0 && (
                <div className="space-y-2">
                  <div className="font-mono text-xs font-bold text-cyber-green">
                    &gt; KEY CAPABILITIES
                  </div>
                  <ul className="space-y-1.5 font-mono text-xs text-cyber-text/90">
                    {activeProject.keyFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyber-green">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {activeProject.techStack.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-cyber-green/30 bg-cyber-green/10 px-2.5 py-1 font-mono text-xs text-cyber-green"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-cyber-border">
                {activeProject.githubUrl && (
                  <a
                    href={activeProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded border border-cyber-green bg-cyber-green px-4 py-2 font-mono text-xs font-bold text-cyber-black"
                  >
                    <Github className="h-4 w-4" />
                    <span>View GitHub Repo</span>
                  </a>
                )}
                {activeProject.liveUrl && (
                  <a
                    href={activeProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded border border-cyber-cyan bg-cyber-cyan/15 px-4 py-2 font-mono text-xs font-bold text-cyber-cyan"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Launch Live Demo</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LINKEDIN POST POPUP MODAL */}
      {activePost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setActivePost(null)}
        >
          <div
            className="cyber-card max-w-lg w-full rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-cyber-border bg-cyber-panel px-5 py-3 font-mono text-xs">
              <span className="text-cyber-cyan">linkedin://dispatch-viewer</span>
              <button
                type="button"
                onClick={() => setActivePost(null)}
                className="text-cyber-muted hover:text-cyber-red"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="font-mono text-xs text-cyber-muted">
                Published: {activePost.postDate}
              </div>
              <h3 className="font-mono text-xl font-bold text-cyber-text">
                {activePost.title}
              </h3>
              <p className="text-sm text-cyber-muted leading-relaxed">
                {activePost.description}
              </p>
              <div className="pt-3 flex justify-end">
                <a
                  href={activePost.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded border border-cyber-cyan bg-cyber-cyan px-4 py-2 font-mono text-xs font-bold text-cyber-black"
                >
                  <Linkedin className="h-4 w-4" />
                  <span>View on LinkedIn</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 09: TERMINAL-STYLE SEARCH MODAL */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 pt-20 p-4 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="cyber-card max-w-2xl w-full rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-cyber-border bg-cyber-panel px-4 py-2.5 font-mono text-xs">
              <span className="text-cyber-green">
                root@sinan-portfolio:~$ search
              </span>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-cyber-muted hover:text-cyber-red"
              >
                ESC
              </button>
            </div>

            <div className="p-4 border-b border-cyber-border flex items-center gap-2 bg-cyber-black">
              <span className="font-mono text-xs text-cyber-green shrink-0">
                search &gt;
              </span>
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  if (e.target.value.trim().toLowerCase() === "clear") {
                    setSearchQuery("");
                  } else {
                    setSearchQuery(e.target.value);
                  }
                }}
                placeholder="Type project, skill, cert, or 'help'..."
                className="w-full bg-transparent font-mono text-sm text-cyber-text focus:outline-none"
              />
            </div>

            <div className="max-h-80 overflow-y-auto p-3 space-y-1.5">
              {!searchQuery.trim() ? (
                <div className="p-4 font-mono text-xs text-cyber-muted space-y-1">
                  <div>
                    &gt; Try searching: <span className="text-cyber-green">Cyber Cube</span>,{" "}
                    <span className="text-cyber-green">Python</span>,{" "}
                    <span className="text-cyber-green">Pentesting</span>,{" "}
                    <span className="text-cyber-green">CTF</span>, or{" "}
                    <span className="text-cyber-cyan">help</span>
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 font-mono text-xs text-cyber-red">
                  &gt; 0 matches found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                searchResults.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    onClick={() => {
                      setSearchOpen(false);
                      if (item.onSelect) item.onSelect();
                    }}
                    className="flex items-center justify-between rounded border border-transparent hover:border-cyber-green/40 bg-cyber-black/60 px-3.5 py-2.5 transition-all"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-cyber-text">
                        {item.title}
                      </div>
                      <div className="font-mono text-[11px] text-cyber-muted">
                        {item.subtitle}
                      </div>
                    </div>
                    <span className="rounded border border-cyber-cyan/30 bg-cyber-cyan/10 px-2 py-0.5 font-mono text-[10px] text-cyber-cyan">
                      {item.type}
                    </span>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

