import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid admin email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const contactSubmissionSchema = z.object({
  senderName: z.string().min(2, "Name must be at least 2 characters").max(100),
  senderEmail: z.string().email("Enter a valid email address").max(150),
  subject: z.string().min(2, "Subject is required").max(200).default("Portfolio Inquiry"),
  category: z
    .enum(["General", "Cybersecurity", "Project Collaboration", "Job Opportunity", "Other"])
    .default("General"),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  honeypot: z.string().max(0).optional(), // Spam trap
});

export const contactReplySchema = z.object({
  subject: z.string().min(2, "Reply subject is required").max(200),
  body: z.string().min(5, "Reply message cannot be empty").max(10000),
});

export const projectSchema = z.object({
  title: z.string().min(2, "Project title is required").max(150),
  slug: z
    .string()
    .min(2)
    .max(150)
    .regex(/^[a-z0-9-]+$/, "Slug must contain lowercase letters, numbers, and hyphens"),
  summary: z.string().min(10, "Short summary is required").max(400),
  description: z.string().min(10, "Full description is required"),
  architecture: z.string().optional().nullable(),
  keyFeatures: z.array(z.string()).default([]),
  thumbnailUrl: z.string().optional().nullable(),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  liveUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  techStack: z.array(z.string()).default([]),
  category: z.string().default("Cybersecurity"),
  devStatus: z.string().default("Completed"),
  isFeatured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  displayOrder: z.number().int().default(0),
});

export const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(100),
  commandLabel: z.string().max(120).optional().nullable(),
  categoryId: z.string().min(1, "Skill category is required"),
  icon: z.string().optional().nullable(),
  proficiency: z.number().int().min(0).max(100).default(80),
  displayOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
});

export const skillCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  icon: z.string().default("Terminal"),
  terminalHeader: z.string().default("bin/skills.sh"),
  displayOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
});

export const experienceSchema = z.object({
  title: z.string().min(2).max(150),
  organization: z.string().min(2).max(150),
  location: z.string().max(120).optional().nullable(),
  type: z.string().default("Experience"),
  startDate: z.string().min(2).max(50),
  endDate: z.string().max(50).optional().nullable(),
  isCurrent: z.boolean().default(false),
  description: z.string().min(5),
  highlights: z.array(z.string()).default([]),
  displayOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
});

export const educationSchema = z.object({
  degree: z.string().min(2).max(150),
  institution: z.string().min(2).max(200),
  university: z.string().max(150).optional().nullable(),
  location: z.string().max(120).optional().nullable(),
  startYear: z.string().min(2).max(30),
  endYear: z.string().max(30).optional().nullable(),
  isCurrent: z.boolean().default(true),
  description: z.string().optional().nullable(),
  grade: z.string().max(50).optional().nullable(),
  displayOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
});

export const certificationSchema = z.object({
  title: z.string().min(2).max(180),
  organization: z.string().min(2).max(180),
  issueDate: z.string().min(2).max(50),
  credentialId: z.string().max(120).optional().nullable(),
  verifyUrl: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  icon: z.string().default("Award"),
  displayOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
});

export const linkedInPostSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(5),
  postUrl: z.string().url("Must be a valid LinkedIn URL"),
  imageUrl: z.string().optional().nullable(),
  postDate: z.string().default("2026"),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
});

export const siteSettingsSchema = z.object({
  siteName: z.string().min(2).max(200),
  heroBadge: z.string().max(120),
  heroGreeting: z.string().max(120),
  heroName: z.string().min(2).max(120),
  heroTitles: z.array(z.string()).min(1),
  heroBio: z.string().min(10),
  profileImage: z.string().optional().nullable(),
  cvUrl: z.string().optional().nullable(),
  primaryCtaLabel: z.string().max(80),
  primaryCtaUrl: z.string().max(200),
  secondaryCtaLabel: z.string().max(80),
  secondaryCtaUrl: z.string().max(200),
  glitchIntensity: z.enum(["OFF", "LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  showStats: z.boolean().default(true),
  aboutHeading: z.string().max(150),
  aboutBio: z.string().min(10),
  careerObjective: z.string().min(10),
  location: z.string().max(150),
  contactEmail: z.string().email(),
  emailNotifications: z.boolean().default(true),
  notifyEmail: z.string().email(),
  clarityProjectId: z.string().optional().nullable(),
  maintenanceMode: z.boolean().default(false),
  disableAnimations: z.boolean().default(false),
  footerText: z.string().max(250),
});

