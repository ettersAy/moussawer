import bcrypt from "bcryptjs";
import { addDays, addHours, setHours, setMinutes } from "date-fns";
import { BookingStatus, DisputeStatus, IncidentStatus, PrismaClient, Role } from "@prisma/client";
import { categoryNames } from "./seed-data/categories";
import { photographerSpecs, type PhotographerSpec } from "./seed-data/photographers";
import {
  seedAccounts, reviewData, conversationData,
  incidentData, disputeData, notificationsData
} from "./seed-data/bookings";

const prisma = new PrismaClient();

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function nextDay(dayOfWeek: number, hour: number, minute = 0) {
  const today = new Date();
  const delta = (dayOfWeek + 7 - today.getDay()) % 7 || 7;
  const date = addDays(today, delta);
  return setMinutes(setHours(date, hour), minute);
}

async function reset() {
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.disputeComment.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.calendarBlock.deleteMany();
  await prisma.availabilityRule.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.photographerService.deleteMany();
  await prisma.photographerCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.photographerProfile.deleteMany();
  await prisma.user.deleteMany();
}

async function createCategories() {
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.create({ data: { name, slug: slugify(name) } })
    )
  );
  return Object.fromEntries(categories.map((cat) => [cat.slug, cat]));
}

async function createPhotographer(spec: PhotographerSpec, bySlug: Record<string, { id: string }>, passwordHash: string) {
  return prisma.user.create({
    data: {
      email: spec.email,
      passwordHash,
      name: spec.name,
      role: Role.PHOTOGRAPHER,
      avatarUrl: spec.avatarUrl,
      photographerProfile: {
        create: {
          slug: slugify(spec.name),
          bio: spec.bio,
          city: spec.city,
          country: "Canada",
          profileImageUrl: spec.profileImageUrl,
          startingPrice: spec.startingPrice,
          rating: spec.rating,
          reviewCount: spec.reviewCount,
          verified: spec.verified,
          popularity: Math.floor(spec.rating * 20),
          categories: {
            create: spec.categorySlugs.map((categorySlug) => ({ categoryId: bySlug[categorySlug].id }))
          },
          services: {
            create: spec.services.map(([title, description, durationMinutes, price, categorySlug]) => ({
              title: String(title),
              description: String(description),
              durationMinutes: Number(durationMinutes),
              price: Number(price),
              categoryId: bySlug[String(categorySlug)].id
            }))
          },
          portfolioItems: {
            create: spec.images.map((imageUrl, index) => ({
              title: `${spec.name.split(" ")[0]} Portfolio ${index + 1}`,
              description: "Selected work from a recent client session.",
              imageUrl,
              isFeatured: index === 0,
              sortOrder: index,
              tags: spec.categorySlugs.join(","),
              categoryId: bySlug[spec.categorySlugs[index % spec.categorySlugs.length]].id
            }))
          },
          availabilityRules: {
            create: [1, 2, 3, 4, 5, 6].flatMap((dayOfWeek) => [
              { dayOfWeek, startTime: "09:00", endTime: "12:00", timezone: "America/Toronto" },
              { dayOfWeek, startTime: "13:00", endTime: "17:00", timezone: "America/Toronto" }
            ])
          }
        }
      }
    },
    include: { photographerProfile: { include: { services: true } } }
  });
}

async function main() {
  await reset();

  const passwordHash = await bcrypt.hash("password", 12);
  const bySlug = await createCategories();

  const admin = await prisma.user.create({
    data: {
      email: seedAccounts.admin.email,
      passwordHash,
      name: seedAccounts.admin.name,
      role: Role.ADMIN,
      avatarUrl: seedAccounts.admin.avatarUrl
    }
  });

  const client = await prisma.user.create({
    data: {
      email: seedAccounts.client.email,
      passwordHash,
      name: seedAccounts.client.name,
      role: Role.CLIENT,
      avatarUrl: seedAccounts.client.avatarUrl,
      clientProfile: {
        create: {
          location: seedAccounts.client.location,
          bio: seedAccounts.client.bio,
          phone: seedAccounts.client.phone
        }
      }
    }
  });

  const photographers = [];
  for (const spec of photographerSpecs) {
    const user = await createPhotographer(spec, bySlug, passwordHash);
    photographers.push(user.photographerProfile!);
  }

  const firstPhotographer = photographers[0];
  const firstService = firstPhotographer.services[0];
  const pendingStart = nextDay(2, 9);
  const confirmedStart = nextDay(3, 13);
  const completedStart = addDays(new Date(), -7);

  const pendingBooking = await prisma.booking.create({
    data: {
      clientId: client.id,
      photographerId: firstPhotographer.id,
      serviceId: firstService.id,
      startAt: pendingStart,
      endAt: addHours(pendingStart, 2),
      location: "Distillery District, Toronto",
      notes: "Looking for a soft editorial feel.",
      status: BookingStatus.PENDING,
      priceEstimate: firstService.price
    }
  });

  await prisma.booking.create({
    data: {
      clientId: client.id,
      photographerId: firstPhotographer.id,
      serviceId: firstService.id,
      startAt: confirmedStart,
      endAt: addHours(confirmedStart, 2),
      location: "Trinity Bellwoods Park",
      notes: "Brand portraits for launch week.",
      status: BookingStatus.CONFIRMED,
      confirmedAt: new Date(),
      priceEstimate: firstService.price
    }
  });

  const completedBooking = await prisma.booking.create({
    data: {
      clientId: client.id,
      photographerId: firstPhotographer.id,
      serviceId: firstService.id,
      startAt: completedStart,
      endAt: addHours(completedStart, 2),
      location: "King West Studio",
      notes: "Completed sample session for review workflow.",
      status: BookingStatus.COMPLETED,
      confirmedAt: addDays(completedStart, -3),
      completedAt: addHours(completedStart, 3),
      priceEstimate: firstService.price
    }
  });

  await prisma.review.create({
    data: {
      bookingId: completedBooking.id,
      clientId: client.id,
      photographerId: firstPhotographer.id,
      rating: reviewData.rating,
      comment: reviewData.comment
    }
  });

  const conversation = await prisma.conversation.create({
    data: {
      bookingId: pendingBooking.id,
      subject: conversationData.subject,
      participants: {
        create: [{ userId: client.id }, { userId: photographers[0].userId }]
      },
      messages: {
        create: [
          { senderId: client.id, body: conversationData.messages[0].body },
          { senderId: photographers[0].userId, body: conversationData.messages[1].body }
        ]
      }
    }
  });

  await prisma.incident.create({
    data: {
      reporterId: client.id,
      targetUserId: photographers[2].userId,
      category: incidentData.category,
      description: incidentData.description,
      status: IncidentStatus.UNDER_REVIEW,
      adminNotes: "Waiting for photographer context."
    }
  });

  const dispute = await prisma.dispute.create({
    data: {
      reporterId: client.id,
      targetUserId: photographers[0].userId,
      bookingId: pendingBooking.id,
      type: disputeData.type,
      description: disputeData.description,
      status: DisputeStatus.AWAITING_RESPONSE,
      comments: {
        create: [{ authorId: client.id, body: disputeData.comment }]
      }
    }
  });

  await prisma.favorite.create({
    data: {
      userId: client.id,
      photographerId: photographers[1].id
    }
  });

  await prisma.calendarBlock.create({
    data: {
      photographerId: firstPhotographer.id,
      startAt: nextDay(5, 13),
      endAt: nextDay(5, 17),
      reason: "Studio maintenance"
    }
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: photographers[0].userId,
        type: notificationsData[0].type,
        title: notificationsData[0].title,
        body: notificationsData[0].body,
        metadata: JSON.stringify({ bookingId: pendingBooking.id })
      },
      {
        userId: client.id,
        type: notificationsData[1].type,
        title: notificationsData[1].title,
        body: notificationsData[1].body,
        metadata: JSON.stringify({ conversationId: conversation.id })
      },
      {
        userId: admin.id,
        type: notificationsData[2].type,
        title: notificationsData[2].title,
        body: notificationsData[2].body,
        metadata: JSON.stringify({ disputeId: dispute.id })
      }
    ]
  });

  await prisma.activityLog.createMany({
    data: [
      { actorId: client.id, action: "booking.create", entity: "Booking", entityId: pendingBooking.id },
      { actorId: client.id, action: "dispute.create", entity: "Dispute", entityId: dispute.id },
      { actorId: admin.id, action: "seed.complete", entity: "System", entityId: "seed" }
    ]
  });

  console.log("Seeded Moussawer demo data");
  console.log("admin@example.com / password");
  console.log("photographer-one@example.com / password");
  console.log("client@example.com / password");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
