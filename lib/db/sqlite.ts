import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
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
} from "./default-data";

const DB_DIR = path.join(process.cwd(), "prisma");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, "local.db");
let dbInstance: any = null;

export function getLocalDb() {
  if (dbInstance) return dbInstance;

  dbInstance = new Database(DB_PATH);

  // Initialize SQLite tables
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      data TEXT
    );
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      sender_name TEXT,
      sender_email TEXT,
      subject TEXT,
      category TEXT,
      message TEXT,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS contact_replies (
      id TEXT PRIMARY KEY,
      message_id TEXT,
      admin_email TEXT,
      subject TEXT,
      body TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT,
      slug TEXT UNIQUE,
      summary TEXT,
      description TEXT,
      architecture TEXT,
      key_features TEXT,
      github_url TEXT,
      live_url TEXT,
      tech_stack TEXT,
      category TEXT,
      dev_status TEXT,
      is_featured INTEGER,
      display_order INTEGER
    );
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT,
      category_id TEXT,
      command_label TEXT,
      proficiency INTEGER,
      display_order INTEGER,
      is_visible INTEGER,
      is_featured INTEGER
    );
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      action TEXT,
      entity_type TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return dbInstance;
}

