import { createApp } from "./app";
import { config } from "./config";
import { prisma } from "./db";

async function main() {
  // Verify database connectivity before starting the server
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set. Check your .env file or Render environment variables.");
    process.exit(1);
  }

  // Attempt database connection but don't crash if it fails
  // Prisma will lazily connect on first query anyway
  try {
    await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database connection timed out after 10 seconds")), 10_000)
      )
    ]);
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.warn("⚠️ Database connection failed at startup, will retry on first query:", err);
    console.warn("   The server will start but API endpoints may return 500 until the database is reachable.");
  }

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`Moussawer API running on http://localhost:${config.port}`);
    console.log(`API docs available at http://localhost:${config.port}/api-docs`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\n❌ Port ${config.port} is already in use.\n` +
        `   Run \`lsof -i :${config.port}\` to find the process, or change PORT in .env\n`
      );
      process.exit(1);
    }
    throw err;
  });
}

main();
