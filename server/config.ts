import dotenv from "dotenv";

dotenv.config();

export const config = {
  databaseUrl: process.env.DATABASE_URL ?? "file:./dev.db",
  jwtSecret: process.env.JWT_SECRET ?? "dev-only-change-me",
  port: Number(process.env.PORT ?? 4000),
  apiVersion: "v1",
  isTest: process.env.NODE_ENV === "test"
};
