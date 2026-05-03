import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

// Set connection pool timeout to fail fast instead of hanging indefinitely
// This is especially important for PgBouncer connections that may time out
prisma.$on("beforeExit" as never, async () => {
  await prisma.$disconnect();
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
