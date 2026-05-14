import { prisma } from "../db";
import type { GoogleEvent } from "./google-calendar";

export async function upsertGoogleEvents(
  photographerId: string,
  events: GoogleEvent[]
): Promise<number> {
  if (events.length === 0) return 0;

  const googleEventIds = events.map((e) => e.id);

  await prisma.calendarBlock.deleteMany({
    where: {
      photographerId,
      source: "google_calendar",
      googleEventId: { notIn: googleEventIds }
    }
  });

  for (const event of events) {
    await prisma.calendarBlock.upsert({
      where: {
        photographerId_googleEventId: {
          photographerId,
          googleEventId: event.id
        }
      },
      create: {
        photographerId,
        startAt: event.start,
        endAt: event.end,
        reason: `Google Calendar: ${event.summary}`,
        source: "google_calendar",
        googleEventId: event.id
      },
      update: {
        startAt: event.start,
        endAt: event.end,
        reason: `Google Calendar: ${event.summary}`
      }
    });
  }

  return events.length;
}
