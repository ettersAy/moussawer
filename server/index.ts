import { createApp } from "./app";
import { config } from "./config";
import { prisma } from "./db";

async function main() {
  // Verify database connectivity before starting the server
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set. Check your .env file or Render environment variables.");
    process.exit(1);
  }

  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
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
