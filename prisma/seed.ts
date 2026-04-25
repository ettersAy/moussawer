import bcrypt from "bcryptjs";
import { addDays, addHours, setHours, setMinutes } from "date-fns";
import { BookingStatus, DisputeStatus, IncidentStatus, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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

async function main() {
  await reset();

  const passwordHash = await bcrypt.hash("password", 12);
  const categories = await Promise.all(
    ["Wedding", "Portrait", "Event", "Commercial", "Family", "Fashion"].map((name) =>
      prisma.category.create({
        data: { name, slug: slugify(name) }
      })
    )
  );
  const bySlug = Object.fromEntries(categories.map((category) => [category.slug, category]));

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      passwordHash,
      name: "Moussawer Admin",
      role: Role.ADMIN,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
    }
  });

  const client = await prisma.user.create({
    data: {
      email: "client@example.com",
      passwordHash,
      name: "Nadia Client",
      role: Role.CLIENT,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      clientProfile: {
        create: {
          location: "Toronto, ON",
          bio: "Planning modern events and brand shoots across the GTA.",
          phone: "+1 416 555 0100"
        }
      }
    }
  });

  const photographerSpecs = [
    {
      email: "photographer-one@example.com",
      name: "Amir Haddad",
      city: "Toronto",
      bio: "Editorial wedding and portrait photographer with a calm, cinematic style.",
      profileImageUrl: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=900&q=80",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      startingPrice: 320,
      rating: 4.9,
      reviewCount: 18,
      verified: true,
      categorySlugs: ["wedding", "portrait"],
      services: [
        ["Signature Portrait Session", "Two-hour portrait shoot with 20 edited images.", 120, 320, "portrait"],
        ["Wedding Story Package", "Half-day wedding coverage with gallery delivery.", 360, 1450, "wedding"]
      ],
      images: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      email: "photographer-two@example.com",
      name: "Leila Morgan",
      city: "Montreal",
      bio: "Fashion, commercial, and product imagery with polished studio lighting.",
      profileImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80",
      startingPrice: 450,
      rating: 4.8,
      reviewCount: 14,
      verified: true,
      categorySlugs: ["fashion", "commercial"],
      services: [
        ["Studio Campaign", "Commercial studio session with art-direction support.", 180, 850, "commercial"],
        ["Lookbook Session", "Fashion lookbook coverage for emerging brands.", 240, 980, "fashion"]
      ],
      images: [
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      email: "photographer-three@example.com",
      name: "Jonas Reed",
      city: "Ottawa",
      bio: "Warm documentary coverage for families, conferences, and community events.",
      profileImageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
      startingPrice: 240,
      rating: 4.7,
      reviewCount: 11,
      verified: false,
      categorySlugs: ["family", "event"],
      services: [
        ["Family Afternoon", "Relaxed family session with a private digital gallery.", 90, 240, "family"],
        ["Event Essentials", "Coverage for launches, panels, and private celebrations.", 180, 650, "event"]
      ],
      images: [
        "https://images.unsplash.com/photo-1491013516836-7db643ee125a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"
      ]
    }
  ];

  const photographers = [];
  for (const spec of photographerSpecs) {
    const user = await prisma.user.create({
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
      rating: 5,
      comment: "The direction was clear, the gallery was beautiful, and the whole process felt effortless."
    }
  });

  const conversation = await prisma.conversation.create({
    data: {
      bookingId: pendingBooking.id,
      subject: "Portrait session logistics",
      participants: {
        create: [{ userId: client.id }, { userId: photographers[0].userId }]
      },
      messages: {
        create: [
          { senderId: client.id, body: "Can we keep the shoot near covered walkways if it rains?" },
          { senderId: photographers[0].userId, body: "Absolutely. I have two backup spots within a five-minute walk." }
        ]
      }
    }
  });

  await prisma.incident.create({
    data: {
      reporterId: client.id,
      targetUserId: photographers[2].userId,
      category: "Late arrival",
      description: "Sample incident for admin triage and client visibility.",
      status: IncidentStatus.UNDER_REVIEW,
      adminNotes: "Waiting for photographer context."
    }
  });

  const dispute = await prisma.dispute.create({
    data: {
      reporterId: client.id,
      targetUserId: photographers[0].userId,
      bookingId: pendingBooking.id,
      type: "Package disagreement",
      description: "Sample dispute about deliverable scope.",
      status: DisputeStatus.AWAITING_RESPONSE,
      comments: {
        create: [{ authorId: client.id, body: "I expected retouching to be included in the quote." }]
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
        type: "booking.requested",
        title: "New booking request",
        body: "Nadia requested a portrait session.",
        metadata: JSON.stringify({ bookingId: pendingBooking.id })
      },
      {
        userId: client.id,
        type: "message.created",
        title: "New message",
        body: "Amir replied to your session logistics.",
        metadata: JSON.stringify({ conversationId: conversation.id })
      },
      {
        userId: admin.id,
        type: "dispute.created",
        title: "Dispute awaiting response",
        body: "A package disagreement needs admin visibility.",
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
