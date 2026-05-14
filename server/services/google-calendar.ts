import { google } from "googleapis";
import { config } from "../config";
import { encrypt, decrypt } from "./encryption";

const EVENTS_WINDOW_DAYS = 90;

export function getOAuthClient() {
  return new google.auth.OAuth2(config.google.clientId, config.google.clientSecret, config.google.redirectUri);
}

export function getAuthUrl(userId: string): string {
  const oauth2Client = getOAuthClient();
  const state = encrypt(JSON.stringify({ userId, ts: Date.now() }));
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.readonly"],
    state
  });
}

export async function exchangeCode(code: string) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error("Google did not return a refresh token. Ensure prompt=consent and access_type=offline are set.");
  }
  return {
    refreshToken: encrypt(tokens.refresh_token),
    calendarId: tokens.scope?.includes("calendar.readonly") ? "primary" : "primary"
  };
}

export async function refreshAccessToken(encryptedRefreshToken: string) {
  const refreshToken = decrypt(encryptedRefreshToken);
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  if (!credentials.access_token) {
    throw new Error("Failed to refresh Google access token");
  }
  return credentials.access_token;
}

export interface GoogleEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
}

export async function listUpcomingEvents(
  accessToken: string,
  calendarId: string,
  syncToken?: string | null
): Promise<{ events: GoogleEvent[]; nextSyncToken: string }> {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + EVENTS_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const params: any = {
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250
  };

  if (syncToken) {
    params.syncToken = syncToken;
    delete params.timeMin;
    delete params.timeMax;
  }

  const response = await calendar.events.list(params);

  const events: GoogleEvent[] = (response.data.items ?? [])
    .filter((e) => e.start?.dateTime && e.end?.dateTime && e.status !== "cancelled")
    .map((e) => ({
      id: e.id!,
      summary: e.summary ?? "Busy",
      start: new Date(e.start!.dateTime!),
      end: new Date(e.end!.dateTime!)
    }));

  return { events, nextSyncToken: response.data.nextSyncToken ?? "" };
}

export async function revokeToken(encryptedRefreshToken: string): Promise<void> {
  try {
    const refreshToken = decrypt(encryptedRefreshToken);
    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    await oauth2Client.revokeCredentials();
  } catch {
    // Token may already be invalid; proceed with cleanup
  }
}
