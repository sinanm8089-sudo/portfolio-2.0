import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  checkDatabaseConnection,
  getPublicPortfolioData,
} from "@/lib/db/queries";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const dbStatus = await checkDatabaseConnection();

  if (!dbStatus.connected) {
    const fallback = await getPublicPortfolioData();
    const totalSkills = fallback.skillCategories.reduce(
      (acc, c) => acc + c.skills.length,
      0
    );
    return NextResponse.json({
      ok: true,
      dbConnected: false,
      dbError: dbStatus.error,
      stats: {
        totalProjects: fallback.projects.length,
        totalSkills,
        totalCertifications: fallback.certifications.length,
        totalLinkedInPosts: fallback.linkedInPosts.length,
        totalMessages: 0,
        unreadMessages: 0,
      },
      recentMessages: [],
      recentActivity: [],
    });
  }

  const [
    totalProjects,
    totalSkills,
    totalCertifications,
    totalLinkedInPosts,
    totalMessages,
    unreadMessages,
    recentMessages,
    recentActivity,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.skill.count(),
    prisma.certification.count(),
    prisma.linkedInPost.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return NextResponse.json({
    ok: true,
    dbConnected: true,
    stats: {
      totalProjects,
      totalSkills,
      totalCertifications,
      totalLinkedInPosts,
      totalMessages,
      unreadMessages,
    },
    recentMessages,
    recentActivity,
  });
}

