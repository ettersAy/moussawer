import request from "supertest";
import { addDays, getDay, startOfDay } from "date-fns";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../server/app";
import { prisma } from "../server/db";

const app = createApp();

async function login(email: string) {
  const response = await request(app).post("/api/v1/auth/login").send({ email, password: "password" }).expect(200);
  return response.body.data.token as string;
}

/** Return YYYY-MM-DD for the next occurrence of dayOfWeek (0=Sun, 1=Mon, ... 6=Sat) in the server's local timezone. */
function nextWeekday(dayOfWeek: number) {
  const today = startOfDay(new Date());
  const currentDay = getDay(today);
  const delta = (dayOfWeek + 7 - currentDay) % 7 || 7;
  const target = addDays(today, delta);
  // Format as YYYY-MM-DD in local time
  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  const dd = String(target.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

describe("Moussawer API", () => {
  let adminToken = "";
  let clientToken = "";
  let photographerToken = "";

  beforeAll(async () => {
    adminToken = await login("admin@example.com");
    clientToken = await login("client@example.com");
    photographerToken = await login("photographer-one@example.com");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("authenticates seeded accounts and protects admin routes", async () => {
    const me = await request(app).get("/api/v1/me").set("Authorization", `Bearer ${clientToken}`).expect(200);
    expect(me.body.data.email).toBe("client@example.com");

    await request(app).get("/api/v1/admin/stats").set("Authorization", `Bearer ${clientToken}`).expect(403);
    const stats = await request(app).get("/api/v1/admin/stats").set("Authorization", `Bearer ${adminToken}`).expect(200);
    expect(stats.body.data.totalUsers).toBeGreaterThanOrEqual(5);
  });

  it("searches photographers and returns public profile resources", async () => {
    const search = await request(app).get("/api/v1/photographers?location=Toronto&category=portrait").expect(200);
    expect(search.body.data.length).toBeGreaterThan(0);
    expect(search.body.data[0].email).toBeDefined();
    expect(search.body.data[0].passwordHash).toBeUndefined();

    const profile = await request(app).get(`/api/v1/photographers/${search.body.data[0].slug}`).expect(200);
    expect(profile.body.data.services.length).toBeGreaterThan(0);
    expect(profile.body.data.portfolioItems.length).toBeGreaterThan(0);
  });

  it("lists availability, creates bookings, and rejects conflicts", async () => {
    const photographers = await request(app).get("/api/v1/photographers?location=Toronto").expect(200);
    const photographer = photographers.body.data[0];
    const service = photographer.services[0];
    const date = nextWeekday(1);

    const availability = await request(app)
      .get(`/api/v1/photographers/${photographer.slug}/availability?date=${date}&serviceId=${service.id}`)
      .expect(200);
    const slot = availability.body.data.slots.find((item: { available: boolean }) => item.available);
    expect(slot).toBeTruthy();

    const booking = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        photographerId: photographer.id,
        serviceId: service.id,
        startAt: slot.startAt,
        location: "API Test Studio",
        notes: "Testing a booking from an available slot."
      })
      .expect(201);
    expect(booking.body.data.status).toBe("PENDING");

    await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        photographerId: photographer.id,
        serviceId: service.id,
        startAt: slot.startAt,
        location: "API Test Studio"
      })
      .expect(409);
  });

  it("enforces booking transitions and permissions", async () => {
    const list = await request(app).get("/api/v1/bookings").set("Authorization", `Bearer ${clientToken}`).expect(200);
    const pending = list.body.data.find((booking: { status: string }) => booking.status === "PENDING");
    expect(pending).toBeTruthy();

    await request(app)
      .patch(`/api/v1/bookings/${pending.id}/status`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ status: "COMPLETED" })
      .expect(422);

    const confirmed = await request(app)
      .patch(`/api/v1/bookings/${pending.id}/status`)
      .set("Authorization", `Bearer ${photographerToken}`)
      .send({ status: "CONFIRMED" })
      .expect(200);
    expect(confirmed.body.data.status).toBe("CONFIRMED");
  });

  it("handles conversations and message read state", async () => {
    const conversations = await request(app).get("/api/v1/conversations").set("Authorization", `Bearer ${clientToken}`).expect(200);
    expect(conversations.body.data.length).toBeGreaterThan(0);
    const conversation = conversations.body.data[0];

    const message = await request(app)
      .post(`/api/v1/conversations/${conversation.id}/messages`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ body: "Automated test message." })
      .expect(201);
    expect(message.body.data.body).toContain("Automated");

    await request(app).patch(`/api/v1/conversations/${conversation.id}/read`).set("Authorization", `Bearer ${photographerToken}`).expect(200);
  });

  it("creates incidents and disputes for visible user cases", async () => {
    const incident = await request(app)
      .post("/api/v1/incidents")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ category: "Safety concern", description: "Automated test incident with enough detail." })
      .expect(201);
    expect(incident.body.data.status).toBe("OPEN");

    const dispute = await request(app)
      .post("/api/v1/disputes")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ type: "Refund request", description: "Automated test dispute with enough detail." })
      .expect(201);
    expect(dispute.body.data.status).toBe("OPEN");
  });

  it("allows photographer portfolio CRUD and validates review rules", async () => {
    const item = await request(app)
      .post("/api/v1/portfolio")
      .set("Authorization", `Bearer ${photographerToken}`)
      .send({
        title: "Automated Portfolio Item",
        imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
        tags: ["test"]
      })
      .expect(201);
    expect(item.body.data.title).toBe("Automated Portfolio Item");

    await request(app)
      .patch(`/api/v1/portfolio/${item.body.data.id}`)
      .set("Authorization", `Bearer ${photographerToken}`)
      .send({ isFeatured: true })
      .expect(200);

    await request(app).delete(`/api/v1/portfolio/${item.body.data.id}`).set("Authorization", `Bearer ${photographerToken}`).expect(204);

    // Find a non-completed booking (either PENDING or CONFIRMED) to verify review validation
    const bookings = await request(app).get("/api/v1/bookings").set("Authorization", `Bearer ${clientToken}`).expect(200);
    const nonCompleted = bookings.body.data.find(
      (b: { status: string }) => b.status === "PENDING" || b.status === "CONFIRMED"
    );
    expect(nonCompleted).toBeTruthy();
    await request(app)
      .post("/api/v1/reviews")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ bookingId: nonCompleted.id, rating: 5 })
      .expect(422);
  });
});
