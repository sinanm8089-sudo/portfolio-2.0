import { prisma } from "./prisma";
import { getGitHubProjects } from "@/lib/github";
import {
  DEFAULT_CERTIFICATIONS,
  DEFAULT_EDUCATION,
  DEFAULT_EXPERIENCE,
  DEFAULT_LINKEDIN_POSTS,
  DEFAULT_NAVIGATION,
  DEFAULT_PROJECTS,
  DEFAULT_SCENE_SETTINGS,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_SKILL_CATEGORIES,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_THEME_SETTINGS,
} from "./default-data";

export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    await prisma.adminUser.count();
    return { connected: true };
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : "Database unreachable",
    };
  }
}

export async function getPublicPortfolioData() {
  try {
    const [
      siteSettings,
      themeSettings,
      sceneSettings,
      navigation,
      socialLinks,
      skillCategories,
      projects,
      education,
      experience,
      certifications,
      linkedInPosts,
    ] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: "default" } }),
      prisma.themeSettings.findUnique({ where: { id: "default" } }),
      prisma.sceneSettings.findUnique({ where: { id: "default" } }),
      prisma.navigationItem.findMany({
        where: { isVisible: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.socialLink.findMany({
        where: { isVisible: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.skillCategory.findMany({
        where: { isVisible: true },
        orderBy: { displayOrder: "asc" },
        include: {
          skills: {
            where: { isVisible: true, status: "PUBLISHED" },
            orderBy: { displayOrder: "asc" },
          },
        },
      }),
      prisma.project.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }],
        include: {
          images: { orderBy: { displayOrder: "asc" } },
        },
      }),
      prisma.education.findMany({
        where: { isVisible: true, status: "PUBLISHED" },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.experience.findMany({
        where: { isVisible: true, status: "PUBLISHED" },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.certification.findMany({
        where: { isVisible: true, status: "PUBLISHED" },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.linkedInPost.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }],
      }),
    ]);

    const safeSite = siteSettings
      ? {
          ...siteSettings,
          heroTitles: typeof siteSettings.heroTitles === "string"
            ? (siteSettings.heroTitles as string).split("\n").filter(Boolean)
            : (siteSettings.heroTitles || DEFAULT_SITE_SETTINGS.heroTitles),
        }
      : DEFAULT_SITE_SETTINGS;

    const safeProjects = projects.map((p) => ({
      ...p,
      keyFeatures: typeof p.keyFeatures === "string"
        ? JSON.parse(p.keyFeatures || "[]")
        : (p.keyFeatures || []),
      techStack: typeof p.techStack === "string"
        ? JSON.parse(p.techStack || "[]")
        : (p.techStack || []),
    }));

    const safeExperience = experience.map((exp) => ({
      ...exp,
      highlights: typeof exp.highlights === "string"
        ? JSON.parse(exp.highlights || "[]")
        : (exp.highlights || []),
    }));

    return {
      dbConnected: true,
      site: safeSite,
      theme: themeSettings ?? DEFAULT_THEME_SETTINGS,
      scene: sceneSettings ?? DEFAULT_SCENE_SETTINGS,
      navigation: navigation.length > 0 ? navigation : DEFAULT_NAVIGATION,
      socialLinks: socialLinks.length > 0 ? socialLinks : DEFAULT_SOCIAL_LINKS,
      skillCategories:
        skillCategories.length > 0 ? skillCategories : DEFAULT_SKILL_CATEGORIES,
      projects: await getGitHubProjects(
        safeProjects.length > 0 ? safeProjects : DEFAULT_PROJECTS
      ),
      education: education.length > 0 ? education : DEFAULT_EDUCATION,
      experience: safeExperience.length > 0 ? safeExperience : DEFAULT_EXPERIENCE,
      certifications:
        certifications.length > 0 ? certifications : DEFAULT_CERTIFICATIONS,
      linkedInPosts:
        linkedInPosts.length > 0 ? linkedInPosts : DEFAULT_LINKEDIN_POSTS,
    };
  } catch {
    return {
      dbConnected: false,
      site: DEFAULT_SITE_SETTINGS,
      theme: DEFAULT_THEME_SETTINGS,
      scene: DEFAULT_SCENE_SETTINGS,
      navigation: DEFAULT_NAVIGATION,
      socialLinks: DEFAULT_SOCIAL_LINKS,
      skillCategories: DEFAULT_SKILL_CATEGORIES,
      projects: await getGitHubProjects(DEFAULT_PROJECTS),
      education: DEFAULT_EDUCATION,
      experience: DEFAULT_EXPERIENCE,
      certifications: DEFAULT_CERTIFICATIONS,
      linkedInPosts: DEFAULT_LINKEDIN_POSTS,
    };
  }
}

export async function logAdminActivity(params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details: params.details,
      },
    });
  } catch {
    // Non-blocking activity log
  }
}

