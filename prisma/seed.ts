import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DEFAULT_SITE_SETTINGS,
  DEFAULT_THEME_SETTINGS,
  DEFAULT_SCENE_SETTINGS,
  DEFAULT_NAVIGATION,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_SKILL_CATEGORIES,
  DEFAULT_PROJECTS,
  DEFAULT_EDUCATION,
  DEFAULT_EXPERIENCE,
  DEFAULT_CERTIFICATIONS,
  DEFAULT_LINKEDIN_POSTS,
} from "../lib/db/default-data";

const prisma = new PrismaClient();

async function main() {
  console.log("> [SEED] Commencing database seed for Portfolio 2.0...");

  const adminEmail = process.env.ADMIN_EMAIL || "sinan.m8089@gmail.com";
  const rawAdminPassword = process.env.ADMIN_PASSWORD || "CyberAdmin2026!";
  const passwordHash = await bcrypt.hash(rawAdminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      name: "Sinan Mohammed",
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Sinan Mohammed",
      role: "ADMIN",
    },
  });
  console.log(`> [SEED] Admin account provisioned: ${adminEmail}`);

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: DEFAULT_SITE_SETTINGS,
    create: DEFAULT_SITE_SETTINGS,
  });

  await prisma.themeSettings.upsert({
    where: { id: "default" },
    update: DEFAULT_THEME_SETTINGS,
    create: DEFAULT_THEME_SETTINGS,
  });

  await prisma.sceneSettings.upsert({
    where: { id: "default" },
    update: DEFAULT_SCENE_SETTINGS,
    create: DEFAULT_SCENE_SETTINGS,
  });

  for (const nav of DEFAULT_NAVIGATION) {
    await prisma.navigationItem.upsert({
      where: { id: nav.id },
      update: nav,
      create: nav,
    });
  }

  for (const soc of DEFAULT_SOCIAL_LINKS) {
    await prisma.socialLink.upsert({
      where: { id: soc.id },
      update: soc,
      create: soc,
    });
  }

  for (const cat of DEFAULT_SKILL_CATEGORIES) {
    const { skills, ...catData } = cat;
    await prisma.skillCategory.upsert({
      where: { slug: catData.slug },
      update: catData,
      create: catData,
    });

    for (const sk of skills) {
      await prisma.skill.upsert({
        where: { id: sk.id },
        update: {
          ...sk,
          status: "PUBLISHED",
        },
        create: {
          ...sk,
          status: "PUBLISHED",
        },
      });
    }
  }

  for (const proj of DEFAULT_PROJECTS) {
    const { images, ...projData } = proj;
    const formattedProj = {
      ...projData,
      keyFeatures: projData.keyFeatures || [],
      techStack: projData.techStack || [],
      status: "PUBLISHED" as const,
    };
    await prisma.project.upsert({
      where: { slug: projData.slug },
      update: formattedProj,
      create: formattedProj,
    });
  }

  for (const edu of DEFAULT_EDUCATION) {
    await prisma.education.upsert({
      where: { id: edu.id },
      update: { ...edu, status: "PUBLISHED" as const },
      create: { ...edu, status: "PUBLISHED" as const },
    });
  }

  for (const exp of DEFAULT_EXPERIENCE) {
    await prisma.experience.upsert({
      where: { id: exp.id },
      update: {
        ...exp,
        highlights: exp.highlights || [],
        status: "PUBLISHED" as const,
      },
      create: {
        ...exp,
        highlights: exp.highlights || [],
        status: "PUBLISHED" as const,
      },
    });
  }

  for (const cert of DEFAULT_CERTIFICATIONS) {
    await prisma.certification.upsert({
      where: { id: cert.id },
      update: { ...cert, status: "PUBLISHED" as const },
      create: { ...cert, status: "PUBLISHED" as const },
    });
  }

  for (const post of DEFAULT_LINKEDIN_POSTS) {
    await prisma.linkedInPost.upsert({
      where: { id: post.id },
      update: { ...post, status: "PUBLISHED" as const },
      create: { ...post, status: "PUBLISHED" as const },
    });
  }

  await prisma.seoMetadata.upsert({
    where: { pageSlug: "home" },
    update: {
      metaTitle: "Sinan Mohammed | Cybersecurity × AI × Full-Stack Portfolio",
      metaDescription:
        "Portfolio 2.0 of Sinan Mohammed — B.Tech Cyber Security student & developer specializing in ethical hacking, penetration testing, AI security, and full-stack engineering.",
      ogTitle: "Sinan Mohammed | Cybersecurity Command Center",
      ogDescription:
        "Explore cybersecurity tools, full-stack projects, verified credentials, and research by Sinan Mohammed.",
      canonicalUrl: "https://sinanm8089-sudo.github.io/",
      keywords: [
        "Sinan Mohammed",
        "Cybersecurity",
        "Penetration Testing",
        "Ethical Hacking",
        "AI Security",
        "Full-Stack Developer",
        "Kerala",
        "KTU",
      ],
      noIndex: false,
    },
    create: {
      pageSlug: "home",
      metaTitle: "Sinan Mohammed | Cybersecurity × AI × Full-Stack Portfolio",
      metaDescription:
        "Portfolio 2.0 of Sinan Mohammed — B.Tech Cyber Security student & developer specializing in ethical hacking, penetration testing, AI security, and full-stack engineering.",
      ogTitle: "Sinan Mohammed | Cybersecurity Command Center",
      ogDescription:
        "Explore cybersecurity tools, full-stack projects, verified credentials, and research by Sinan Mohammed.",
      canonicalUrl: "https://sinanm8089-sudo.github.io/",
      keywords: [
        "Sinan Mohammed",
        "Cybersecurity",
        "Penetration Testing",
        "Ethical Hacking",
        "AI Security",
        "Full-Stack Developer",
        "Kerala",
        "KTU",
      ],
      noIndex: false,
    },
  });

  console.log("> [SEED] Database seeded with PostgreSQL live data!");
}

main()
  .catch((e) => {
    console.error("> [SEED ERROR]", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
