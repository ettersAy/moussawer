import { addMinutes, formatISO, isBefore } from "date-fns";
import { BookingStatus } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../utils/http";

function minutesFromTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function dateWithMinutes(date: string, minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return new Date(`${date}T${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00`);
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function availabilityForDate(photographerId: string, date: string, durationMinutes = 60) {
  const target = new Date(`${date}T12:00:00`);
  if (Number.isNaN(target.getTime())) {
    throw new AppError(422, "VALIDATION_ERROR", "Invalid date");
  }

  const photographer = await prisma.photographerProfile.findUnique({
    where: { id: photographerId },
    include: {
      availabilityRules: true,
      calendarBlocks: true,
      bookings: {
        where: {
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] }
        }
      }
    }
  });

  if (!photographer || !photographer.isPublished) {
    throw new AppError(404, "NOT_FOUND", "Photographer not found");
  }

  const dayOfWeek = target.getDay();
  const rules = photographer.availabilityRules.filter((rule) => rule.dayOfWeek === dayOfWeek);
  const slots = [];

  for (const rule of rules) {
    const ruleStart = minutesFromTime(rule.startTime);
    const ruleEnd = minutesFromTime(rule.endTime);
    for (let cursor = ruleStart; cursor + durationMinutes <= ruleEnd; cursor += durationMinutes) {
      const startAt = dateWithMinutes(date, cursor);
      const endAt = addMinutes(startAt, durationMinutes);
      const inPast = isBefore(startAt, new Date());
      const blocked = photographer.calendarBlocks.some((block) => overlaps(startAt, endAt, block.startAt, block.endAt));
      const booked = photographer.bookings.some((booking) => overlaps(startAt, endAt, booking.startAt, booking.endAt));
      slots.push({
        startAt: formatISO(startAt),
        endAt: formatISO(endAt),
        available: !inPast && !blocked && !booked,
        reason: inPast ? "past" : blocked ? "blocked" : booked ? "booked" : null
      });
    }
  }

  return {
    date,
    timezone: photographer.timezone,
    slots
  };
}

export async function assertBookableSlot(photographerId: string, startAt: Date, endAt: Date) {
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || startAt >= endAt) {
    throw new AppError(422, "VALIDATION_ERROR", "Invalid booking time");
  }

  if (startAt <= new Date()) {
    throw new AppError(422, "VALIDATION_ERROR", "Bookings must be in the future");
  }

  const photographer = await prisma.photographerProfile.findUnique({
    where: { id: photographerId },
    include: {
      availabilityRules: true,
      calendarBlocks: true,
      bookings: {
        where: {
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] }
        }
      }
    }
  });

  if (!photographer || !photographer.isPublished) {
    throw new AppError(404, "NOT_FOUND", "Photographer not found");
  }

  const dayOfWeek = startAt.getDay();
  const startMinutes = startAt.getHours() * 60 + startAt.getMinutes();
  const endMinutes = endAt.getHours() * 60 + endAt.getMinutes();
  const insideRule = photographer.availabilityRules.some((rule) => {
    return (
      rule.dayOfWeek === dayOfWeek &&
      startMinutes >= minutesFromTime(rule.startTime) &&
      endMinutes <= minutesFromTime(rule.endTime) &&
      dateKey(startAt) === dateKey(endAt)
    );
  });

  if (!insideRule) {
    throw new AppError(
      409,
      "SLOT_UNAVAILABLE",
      `The photographer is not available at that time. Note: times are in UTC — the photographer's timezone is ${photographer.timezone}. Convert your local time to UTC before booking.`
    );
  }

  const blocked = photographer.calendarBlocks.some((block) => overlaps(startAt, endAt, block.startAt, block.endAt));
  if (blocked) {
    throw new AppError(409, "SLOT_UNAVAILABLE", "That time is blocked by the photographer");
  }

  const bookingConflict = photographer.bookings.some((booking) => overlaps(startAt, endAt, booking.startAt, booking.endAt));
  if (bookingConflict) {
    throw new AppError(409, "BOOKING_CONFLICT", "That time is already reserved");
  }
}
