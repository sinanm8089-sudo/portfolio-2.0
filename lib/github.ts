export const GITHUB_USERNAME = "sinanm8089-sudo";

interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  created_at: string;
  pushed_at: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  architecture?: string | null;
  keyFeatures: string[];
  thumbnailUrl?: string | null;
  githubUrl?: string | null;
  liveUrl?: string | null;
  techStack: string[];
  category: string;
  devStatus: string;
  isFeatured: boolean;
  displayOrder: number;
  stars?: number;
}

function formatRepoTitle(name: string): string {
  // Keep all-caps names (NETSENTINEL-AI) as-is, title-case the rest
  if (name === name.toUpperCase()) return name.replace(/[-_]/g, " ");
  return name
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function inferCategory(repo: GitHubRepo): string {
  const hay = `${repo.name} ${repo.description || ""} ${(repo.topics || []).join(" ")}`.toLowerCase();
  if (/cyber|sentinel|stegan|threat|scan|secur|bull/.test(hay)) return "Cybersecurity";
  if (/\bai\b|ai_|ai-|ml|neural|sign/.test(hay)) return "AI & ML";
  return "Full-Stack";
}

function normalizeUrl(url: string | null | undefined): string {
  return (url || "").toLowerCase().replace(/\/+$/, "");
}

/**
 * Fetches public, non-fork repositories for the configured GitHub user.
 * Cached for 1 hour. Returns null if GitHub is unreachable or rate-limited.
 */
async function fetchRepos(): Promise<GitHubRepo[] | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "portfolio-2.0",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=100`,
      { headers, next: { revalidate: 3600, tags: ["github-repos"] } }
    );
    if (!res.ok) return null;

    const repos = (await res.json()) as GitHubRepo[];
    if (!Array.isArray(repos)) return null;

    return repos.filter(
      (r) =>
        !r.fork &&
        r.name.toLowerCase() !== `${GITHUB_USERNAME}.github.io`
    );
  } catch {
    return null;
  }
}

/**
 * Builds the public project list from GitHub repos of GITHUB_USERNAME only.
 * If a CMS project has a matching githubUrl, its curated content (description,
 * architecture, features, featured flag, order) overrides the auto-generated fields.
 * Falls back to CMS projects that point at GITHUB_USERNAME if GitHub is unreachable.
 */
export async function getGitHubProjects(
  cmsProjects: PortfolioProject[]
): Promise<PortfolioProject[]> {
  const ownerPrefix = `https://github.com/${GITHUB_USERNAME}/`.toLowerCase();
  const ownedCms = cmsProjects.filter((p) =>
    normalizeUrl(p.githubUrl).startsWith(ownerPrefix)
  );

  const repos = await fetchRepos();
  if (!repos) return ownedCms;

  const cmsByUrl = new Map(ownedCms.map((p) => [normalizeUrl(p.githubUrl), p]));

  const projects = repos.map((repo, idx): PortfolioProject => {
    const curated = cmsByUrl.get(normalizeUrl(repo.html_url));
    const techStack = [
      ...(repo.language ? [repo.language] : []),
      ...(repo.topics || []).slice(0, 3),
    ];

    const generated: PortfolioProject = {
      id: `gh-${repo.id}`,
      title: formatRepoTitle(repo.name),
      slug: repo.name.toLowerCase(),
      summary: repo.description || `Public repository by ${GITHUB_USERNAME}.`,
      description:
        repo.description ||
        `${formatRepoTitle(repo.name)} — source code available on GitHub.`,
      architecture: null,
      keyFeatures: [],
      githubUrl: repo.html_url,
      liveUrl: repo.homepage || null,
      techStack: techStack.length > 0 ? techStack : ["GitHub"],
      category: inferCategory(repo),
      devStatus: repo.archived ? "Archived" : "Active",
      isFeatured: false,
      displayOrder: 1000 + idx,
      stars: repo.stargazers_count,
    };

    if (!curated) return generated;

    return {
      ...generated,
      ...curated,
      githubUrl: repo.html_url,
      liveUrl: curated.liveUrl || generated.liveUrl,
      stars: repo.stargazers_count,
    };
  });

  // Curated/featured first, then by display order (repos keep most-recently-pushed order)
  return projects.sort(
    (a, b) =>
      Number(b.isFeatured) - Number(a.isFeatured) ||
      a.displayOrder - b.displayOrder
  );
}

