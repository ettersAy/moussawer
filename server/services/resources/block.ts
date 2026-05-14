import type { CalendarBlock } from "@prisma/client";

export function blockResource(block: CalendarBlock) {
  return {
    id: block.id,
    photographerId: block.photographerId,
    startAt: block.startAt,
    endAt: block.endAt,
    reason: block.reason,
    source: block.source,
    createdAt: block.createdAt
  };
}
