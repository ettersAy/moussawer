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
  // Each entry: [table, column, sqlType, extra]
  const requiredColumns: [string, string, string, string][] = [
    ["User", "googleId", "TEXT", "UNIQUE"],
    ["User", "verified", "BOOLEAN", "DEFAULT false"],
    ["PhotographerProfile", "googleCalendarEnabled", "BOOLEAN", "DEFAULT false"],
    ["PhotographerProfile", "googleRefreshToken", "TEXT", ""],
    ["PhotographerProfile", "googleCalendarId", "TEXT", ""],
    ["PhotographerProfile", "googleSyncToken", "TEXT", ""],
    ["CalendarBlock", "source", "TEXT", ""],
    ["CalendarBlock", "googleEventId", "TEXT", ""],
  ];

  for (const [table, column, sqlType, extra] of requiredColumns) {
    const exists = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${column}'`
    );
    if (exists.length === 0) {
      console.log(`[startup] Adding ${table}.${column} column...`);
      const sql = `ALTER TABLE "${table}" ADD COLUMN "${column}" ${sqlType} ${extra}`.trim();
      await prisma.$executeRawUnsafe(sql);
      console.log(`[startup] ${table}.${column} added successfully`);
    }
  }
}
