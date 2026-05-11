import type { Category, PortfolioItem } from "@prisma/client";

export function portfolioResource(item: PortfolioItem & { category?: Category | null }) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    tags: item.tags ? item.tags.split(",").filter(Boolean) : [],
    isFeatured: item.isFeatured,
    sortOrder: item.sortOrder,
    isModerated: item.isModerated,
    category: item.category ? { id: item.category.id, name: item.category.name, slug: item.category.slug } : null,
    createdAt: item.createdAt
  };
}
