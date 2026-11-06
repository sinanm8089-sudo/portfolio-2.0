import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const newEmail = (process.argv[2] || process.env.ADMIN_EMAIL || "sinan.m8089@gmail.com").toLowerCase().trim();
  const newPassword = process.argv[3] || process.env.ADMIN_PASSWORD || "CyberAdmin2026!";

  console.log(`\n> [RESET-ADMIN] Resetting admin account for: ${newEmail}`);

  const passwordHash = await bcrypt.hash(newPassword, 12);

  const user = await prisma.adminUser.upsert({
    where: { email: newEmail },
    update: {
      passwordHash,
      name: "Sinan Mohammed",
    },
    create: {
      email: newEmail,
      passwordHash,
      name: "Sinan Mohammed",
      role: "ADMIN",
    },
  });

  // Revoke previous active sessions to force fresh login with new password
  await prisma.adminSession.deleteMany({ where: { userId: user.id } });

  console.log(`> [SUCCESS] Password updated for ${newEmail}!`);
  console.log(`> All active sessions invalidated. You can now log in at http://localhost:3000/admin/login\n`);
}

main()
  .catch((e) => {
    console.error("> [ERROR]", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

