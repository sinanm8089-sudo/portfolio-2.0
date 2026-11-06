import { NextRequest, NextResponse } from "next/server";
import { getPublicPortfolioData } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  const data = await getPublicPortfolioData();

  if (!q) {
    return NextResponse.json({
      ok: true,
      query: "",
      results: [],
    });
  }

  const results: Array<{
    type: string;
    id: string;
    title: string;
    subtitle: string;
    href: string;
    tags?: string[];
  }> = [];

  for (const p of data.projects) {
    const hay = `${p.title} ${p.summary} ${p.description} ${p.category} ${p.techStack.join(" ")}`.toLowerCase();
    if (hay.includes(q)) {
      results.push({
        type: "PROJECT",
        id: p.id,
        title: p.title,
        subtitle: p.summary,
        href: `#projects`,
        tags: p.techStack,
      });
    }
  }

  for (const cat of data.skillCategories) {
    for (const sk of cat.skills) {
      const hay = `${sk.name} ${cat.name} ${sk.commandLabel || ""}`.toLowerCase();
      if (hay.includes(q)) {
        results.push({
          type: "SKILL",
          id: sk.id,
          title: sk.name,
          subtitle: cat.name,
          href: `#skills`,
        });
      }
    }
  }

  for (const cert of data.certifications) {
    const hay = `${cert.title} ${cert.organization} ${cert.description || ""} ${cert.credentialId || ""}`.toLowerCase();
    if (hay.includes(q)) {
      results.push({
        type: "CERTIFICATION",
        id: cert.id,
        title: cert.title,
        subtitle: `${cert.organization} (${cert.issueDate})`,
        href: `#certifications`,
      });
    }
  }

  for (const exp of data.experience) {
    const hay = `${exp.title} ${exp.organization} ${exp.description}`.toLowerCase();
    if (hay.includes(q)) {
      results.push({
        type: "EXPERIENCE",
        id: exp.id,
        title: exp.title,
        subtitle: `${exp.organization} (${exp.startDate})`,
        href: `#experience`,
      });
    }
  }

  for (const post of data.linkedInPosts) {
    const hay = `${post.title} ${post.description}`.toLowerCase();
    if (hay.includes(q)) {
      results.push({
        type: "LINKEDIN",
        id: post.id,
        title: post.title,
        subtitle: post.description.slice(0, 100),
        href: `#linkedin`,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    query: q,
    results: results.slice(0, 20),
  });
}

