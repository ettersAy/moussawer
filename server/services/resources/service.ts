import type { Category, PhotographerService } from "@prisma/client";

export function serviceResource(service: PhotographerService & { category?: Category | null }) {
  return {
    id: service.id,
    title: service.title,
    description: service.description,
    durationMinutes: service.durationMinutes,
    price: service.price,
    isActive: service.isActive,
    category: service.category ? { id: service.category.id, name: service.category.name, slug: service.category.slug } : null
  };
}
