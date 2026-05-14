import dotenv from "dotenv";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required");
}

export const config = {
  databaseUrl: process.env.DATABASE_URL ?? "file:./dev.db",
  jwtSecret,
  port: Number(process.env.PORT ?? 4000),
  apiVersion: "v1",
  isTest: process.env.NODE_ENV === "test",
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:4000/api/v1/me/calendar-sync/callback"
  },
  encryptionKey: process.env.ENCRYPTION_KEY ?? ""
};
