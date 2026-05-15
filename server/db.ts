import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

globalForPrisma.prisma = prisma;

export async function runStartupMigrations() {
  const col = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'googleId'`
  );
  if (col.length === 0) {
    console.log("[startup] Adding googleId column to User table...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "googleId" TEXT UNIQUE`);
    console.log("[startup] googleId column added successfully");
  }
}
