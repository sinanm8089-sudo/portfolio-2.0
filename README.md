# Portfolio 2.0 — Sinan Mohammed (Release 1: Core Platform)

Cybersecurity × Artificial Intelligence × Full-Stack Interactive Portfolio & CMS.

## Architecture (Release 1 — P0 Core Platform)

- **Framework**: Next.js App Router (TypeScript)
- **Database**: PostgreSQL + Prisma ORM (`prisma/schema.prisma`)
- **Authentication**: Credentials-based (`bcryptjs` password hashing + HMAC-SHA256 signed HTTP-only cookies + PostgreSQL `AdminSession`)
- **Validation & Security**: Zod schemas, sliding-window rate limiting, honeypot spam protection, security headers
- **Email Delivery**: Resend integration for contact notifications and direct dashboard replies

## Quick Start

1. **Configure PostgreSQL Connection**:
   Open `.env` and set `DATABASE_URL` and `DIRECT_URL` to your PostgreSQL connection string (Neon / Supabase / Railway / Local):
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
   DIRECT_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
   ADMIN_EMAIL="sinan.m8089@gmail.com"
   ADMIN_PASSWORD="CyberAdmin2026!"
   RESEND_API_KEY="re_..."
   ```

2. **Push Database Schema & Seed Initial Portfolio Data**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   - Public Website: `http://localhost:3000`
   - Admin Dashboard CMS: `http://localhost:3000/admin/dashboard`
   - Admin Login: `http://localhost:3000/admin/login`

