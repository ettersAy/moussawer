-- Seed data for Moussawer
-- Password for all users: "password" (bcrypt hash)
-- Run this in Supabase SQL Editor after schema.sql

-- Categories
INSERT INTO "Category" ("id", "name", "slug") VALUES
('cat-wedding', 'Wedding', 'wedding'),
('cat-portrait', 'Portrait', 'portrait'),
('cat-event', 'Event', 'event'),
('cat-commercial', 'Commercial', 'commercial'),
('cat-family', 'Family', 'family'),
('cat-fashion', 'Fashion', 'fashion');

-- Users
INSERT INTO "User" ("id", "email", "passwordHash", "name", "role", "status", "avatarUrl", "createdAt", "updatedAt") VALUES
('user-admin', 'admin@example.com', '$2b$12$k6RW/w7urkNqf3N3pi6IneMR10RQdds/v1/yadmNVaJDxf5LTmPUu', 'Moussawer Admin', 'ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', NOW(), NOW()),
('user-client', 'client@example.com', '$2b$12$k6RW/w7urkNqf3N3pi6IneMR10RQdds/v1/yadmNVaJDxf5LTmPUu', 'Nadia Client', 'CLIENT', 'ACTIVE', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', NOW(), NOW()),
('user-photog-1', 'photographer-one@example.com', '$2b$12$k6RW/w7urkNqf3N3pi6IneMR10RQdds/v1/yadmNVaJDxf5LTmPUu', 'Amir Haddad', 'PHOTOGRAPHER', 'ACTIVE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', NOW(), NOW()),
('user-photog-2', 'photographer-two@example.com', '$2b$12$k6RW/w7urkNqf3N3pi6IneMR10RQdds/v1/yadmNVaJDxf5LTmPUu', 'Leila Morgan', 'PHOTOGRAPHER', 'ACTIVE', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80', NOW(), NOW()),
('user-photog-3', 'photographer-three@example.com', '$2b$12$k6RW/w7urkNqf3N3pi6IneMR10RQdds/v1/yadmNVaJDxf5LTmPUu', 'Jonas Reed', 'PHOTOGRAPHER', 'ACTIVE', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', NOW(), NOW());

-- Client Profile
INSERT INTO "ClientProfile" ("id", "userId", "location", "bio", "phone", "createdAt", "updatedAt") VALUES
('client-profile-1', 'user-client', 'Toronto, ON', 'Planning modern events and brand shoots across the GTA.', '+1 416 555 0100', NOW(), NOW());

-- Photographer Profiles
INSERT INTO "PhotographerProfile" ("id", "userId", "slug", "bio", "city", "country", "profileImageUrl", "startingPrice", "rating", "reviewCount", "popularity", "timezone", "isPublished", "verified", "createdAt", "updatedAt") VALUES
('photog-profile-1', 'user-photog-1', 'amir-haddad', 'Editorial wedding and portrait photographer with a calm, cinematic style.', 'Toronto', 'Canada', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=900&q=80', 320, 4.9, 18, 98, 'America/Toronto', true, true, NOW(), NOW()),
('photog-profile-2', 'user-photog-2', 'leila-morgan', 'Fashion, commercial, and product imagery with polished studio lighting.', 'Montreal', 'Canada', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80', 450, 4.8, 14, 96, 'America/Toronto', true, true, NOW(), NOW()),
('photog-profile-3', 'user-photog-3', 'jonas-reed', 'Warm documentary coverage for families, conferences, and community events.', 'Ottawa', 'Canada', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80', 240, 4.7, 11, 94, 'America/Toronto', true, false, NOW(), NOW());

-- Photographer Categories
INSERT INTO "PhotographerCategory" ("photographerId", "categoryId") VALUES
('photog-profile-1', 'cat-wedding'),
('photog-profile-1', 'cat-portrait'),
('photog-profile-2', 'cat-fashion'),
('photog-profile-2', 'cat-commercial'),
('photog-profile-3', 'cat-family'),
('photog-profile-3', 'cat-event');

-- Photographer Services
INSERT INTO "PhotographerService" ("id", "photographerId", "categoryId", "title", "description", "durationMinutes", "price", "isActive", "createdAt", "updatedAt") VALUES
('service-1-1', 'photog-profile-1', 'cat-portrait', 'Signature Portrait Session', 'Two-hour portrait shoot with 20 edited images.', 120, 320, true, NOW(), NOW()),
('service-1-2', 'photog-profile-1', 'cat-wedding', 'Wedding Story Package', 'Half-day wedding coverage with gallery delivery.', 360, 1450, true, NOW(), NOW()),
('service-2-1', 'photog-profile-2', 'cat-commercial', 'Studio Campaign', 'Commercial studio session with art-direction support.', 180, 850, true, NOW(), NOW()),
('service-2-2', 'photog-profile-2', 'cat-fashion', 'Lookbook Session', 'Fashion lookbook coverage for emerging brands.', 240, 980, true, NOW(), NOW()),
('service-3-1', 'photog-profile-3', 'cat-family', 'Family Afternoon', 'Relaxed family session with a private digital gallery.', 90, 240, true, NOW(), NOW()),
('service-3-2', 'photog-profile-3', 'cat-event', 'Event Essentials', 'Coverage for launches, panels, and private celebrations.', 180, 650, true, NOW(), NOW());

-- Portfolio Items
INSERT INTO "PortfolioItem" ("id", "photographerId", "categoryId", "title", "description", "imageUrl", "tags", "isFeatured", "sortOrder", "isModerated", "createdAt", "updatedAt") VALUES
('portfolio-1-1', 'photog-profile-1', 'cat-wedding', 'Amir Portfolio 1', 'Selected work from a recent client session.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', 'wedding,portrait', true, 0, false, NOW(), NOW()),
('portfolio-1-2', 'photog-profile-1', 'cat-portrait', 'Amir Portfolio 2', 'Selected work from a recent client session.', 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=1200&q=80', 'wedding,portrait', false, 1, false, NOW(), NOW()),
('portfolio-1-3', 'photog-profile-1', 'cat-wedding', 'Amir Portfolio 3', 'Selected work from a recent client session.', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80', 'wedding,portrait', false, 2, false, NOW(), NOW()),
('portfolio-2-1', 'photog-profile-2', 'cat-fashion', 'Leila Portfolio 1', 'Selected work from a recent client session.', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80', 'fashion,commercial', true, 0, false, NOW(), NOW()),
('portfolio-2-2', 'photog-profile-2', 'cat-commercial', 'Leila Portfolio 2', 'Selected work from a recent client session.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80', 'fashion,commercial', false, 1, false, NOW(), NOW()),
('portfolio-2-3', 'photog-profile-2', 'cat-fashion', 'Leila Portfolio 3', 'Selected work from a recent client session.', 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80', 'fashion,commercial', false, 2, false, NOW(), NOW()),
('portfolio-3-1', 'photog-profile-3', 'cat-family', 'Jonas Portfolio 1', 'Selected work from a recent client session.', 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?auto=format&fit=crop&w=1200&q=80', 'family,event', true, 0, false, NOW(), NOW()),
('portfolio-3-2', 'photog-profile-3', 'cat-event', 'Jonas Portfolio 2', 'Selected work from a recent client session.', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80', 'family,event', false, 1, false, NOW(), NOW()),
('portfolio-3-3', 'photog-profile-3', 'cat-family', 'Jonas Portfolio 3', 'Selected work from a recent client session.', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80', 'family,event', false, 2, false, NOW(), NOW());

-- Availability Rules (Mon-Sat, 9-12 and 1-5)
INSERT INTO "AvailabilityRule" ("id", "photographerId", "dayOfWeek", "startTime", "endTime", "timezone", "createdAt") VALUES
-- Photographer 1
('avail-1-1', 'photog-profile-1', 1, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-1-2', 'photog-profile-1', 1, '13:00', '17:00', 'America/Toronto', NOW()),
('avail-1-3', 'photog-profile-1', 2, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-1-4', 'photog-profile-1', 2, '13:00', '17:00', 'America/Toronto', NOW()),
('avail-1-5', 'photog-profile-1', 3, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-1-6', 'photog-profile-1', 3, '13:00', '17:00', 'America/Toronto', NOW()),
('avail-1-7', 'photog-profile-1', 4, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-1-8', 'photog-profile-1', 4, '13:00', '17:00', 'America/Toronto', NOW()),
('avail-1-9', 'photog-profile-1', 5, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-1-10', 'photog-profile-1', 5, '13:00', '17:00', 'America/Toronto', NOW()),
('avail-1-11', 'photog-profile-1', 6, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-1-12', 'photog-profile-1', 6, '13:00', '17:00', 'America/Toronto', NOW()),
-- Photographer 2
('avail-2-1', 'photog-profile-2', 1, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-2-2', 'photog-profile-2', 1, '13:00', '17:00', 'America/Toronto', NOW()),
('avail-2-3', 'photog-profile-2', 2, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-2-4', 'photog-profile-2', 2, '13:00', '17:00', 'America/Toronto', NOW()),
('avail-2-5', 'photog-profile-2', 3, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-2-6', 'photog-profile-2', 3, '13:00', '17:00', 'America/Toronto', NOW()),
('avail-2-7', 'photog-profile-2', 4, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-2-8', 'photog-profile-2', 4, '13:00', '17:00', 'America/Toronto', NOW()),
('avail-2-9', 'photog-profile-2', 5, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-2-10', 'photog-profile-2', 5, '13:00', '17:00', 'America/Toronto', NOW()),
('avail-2-11', 'photog-profile-2', 6, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-2-12', 'photog-profile-2', 6, '13:00', '17:00', 'America/Toronto', NOW()),
-- Photographer 3
('avail-3-1', 'photog-profile-3', 1, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-3-2', 'photog-profile-3', 1, '13:00', '17:00', 'America/Toronto', NOW()),
('avail-3-3', 'photog-profile-3', 2, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-3-4', 'photog-profile-3', 2, '13:00', '17:00', 'America/Toronto', NOW()),
('avail-3-5', 'photog-profile-3', 3, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-3-6', 'photog-profile-3', 3, '13:00', '17:00', 'America/Toronto', NOW()),
('avail-3-7', 'photog-profile-3', 4, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-3-8', 'photog-profile-3', 4, '13:00', '17:00', 'America/Toronto', NOW()),
('avail-3-9', 'photog-profile-3', 5, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-3-10', 'photog-profile-3', 5, '13:00', '17:00', 'America/Toronto', NOW()),
('avail-3-11', 'photog-profile-3', 6, '09:00', '12:00', 'America/Toronto', NOW()),
('avail-3-12', 'photog-profile-3', 6, '13:00', '17:00', 'America/Toronto', NOW());

-- Bookings
INSERT INTO "Booking" ("id", "clientId", "photographerId", "serviceId", "startAt", "endAt", "location", "notes", "status", "priceEstimate", "createdAt", "updatedAt") VALUES
('booking-pending', 'user-client', 'photog-profile-1', 'service-1-1', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '2 hours', 'Distillery District, Toronto', 'Looking for a soft editorial feel.', 'PENDING', 320, NOW(), NOW()),
('booking-confirmed', 'user-client', 'photog-profile-1', 'service-1-1', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '2 hours', 'Trinity Bellwoods Park', 'Brand portraits for launch week.', 'CONFIRMED', 320, NOW(), NOW()),
('booking-completed', 'user-client', 'photog-profile-1', 'service-1-1', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '2 hours', 'King West Studio', 'Completed sample session for review workflow.', 'COMPLETED', 320, NOW(), NOW());

-- Update confirmed and completed bookings with timestamps
UPDATE "Booking" SET "confirmedAt" = NOW() WHERE "id" = 'booking-confirmed';
UPDATE "Booking" SET "confirmedAt" = NOW() - INTERVAL '10 days', "completedAt" = NOW() - INTERVAL '7 days' + INTERVAL '3 hours' WHERE "id" = 'booking-completed';

-- Review
INSERT INTO "Review" ("id", "bookingId", "clientId", "photographerId", "rating", "comment", "isModerated", "createdAt") VALUES
('review-1', 'booking-completed', 'user-client', 'photog-profile-1', 5, 'The direction was clear, the gallery was beautiful, and the whole process felt effortless.', false, NOW());

-- Conversation
INSERT INTO "Conversation" ("id", "bookingId", "subject", "createdAt", "updatedAt") VALUES
('conv-1', 'booking-pending', 'Portrait session logistics', NOW(), NOW());

-- Conversation Participants
INSERT INTO "ConversationParticipant" ("conversationId", "userId") VALUES
('conv-1', 'user-client'),
('conv-1', 'user-photog-1');

-- Messages
INSERT INTO "Message" ("id", "conversationId", "senderId", "body", "createdAt") VALUES
('msg-1', 'conv-1', 'user-client', 'Can we keep the shoot near covered walkways if it rains?', NOW()),
('msg-2', 'conv-1', 'user-photog-1', 'Absolutely. I have two backup spots within a five-minute walk.', NOW() + INTERVAL '1 minute');

-- Incident
INSERT INTO "Incident" ("id", "reporterId", "targetUserId", "category", "description", "status", "adminNotes", "createdAt", "updatedAt") VALUES
('incident-1', 'user-client', 'user-photog-3', 'Late arrival', 'Sample incident for admin triage and client visibility.', 'UNDER_REVIEW', 'Waiting for photographer context.', NOW(), NOW());

-- Dispute
INSERT INTO "Dispute" ("id", "reporterId", "targetUserId", "bookingId", "type", "description", "status", "createdAt", "updatedAt") VALUES
('dispute-1', 'user-client', 'user-photog-1', 'booking-pending', 'Package disagreement', 'Sample dispute about deliverable scope.', 'AWAITING_RESPONSE', NOW(), NOW());

-- Dispute Comment
INSERT INTO "DisputeComment" ("id", "disputeId", "authorId", "body", "createdAt") VALUES
('disc-1', 'dispute-1', 'user-client', 'I expected retouching to be included in the quote.', NOW());

-- Favorite
INSERT INTO "Favorite" ("userId", "photographerId", "createdAt") VALUES
('user-client', 'photog-profile-2', NOW());

-- Calendar Block
INSERT INTO "CalendarBlock" ("id", "photographerId", "startAt", "endAt", "reason", "createdAt") VALUES
('calblock-1', 'photog-profile-1', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '4 hours', 'Studio maintenance', NOW());

-- Notifications
INSERT INTO "Notification" ("id", "userId", "type", "title", "body", "metadata", "createdAt") VALUES
('notif-1', 'user-photog-1', 'booking.requested', 'New booking request', 'Nadia requested a portrait session.', '{"bookingId":"booking-pending"}', NOW()),
('notif-2', 'user-client', 'message.created', 'New message', 'Amir replied to your session logistics.', '{"conversationId":"conv-1"}', NOW()),
('notif-3', 'user-admin', 'dispute.created', 'Dispute awaiting response', 'A package disagreement needs admin visibility.', '{"disputeId":"dispute-1"}', NOW());

-- Activity Logs
INSERT INTO "ActivityLog" ("id", "actorId", "action", "entity", "entityId", "metadata", "createdAt") VALUES
('log-1', 'user-client', 'booking.create', 'Booking', 'booking-pending', '{}', NOW()),
('log-2', 'user-client', 'dispute.create', 'Dispute', 'dispute-1', '{}', NOW()),
('log-3', 'user-admin', 'seed.complete', 'System', 'seed', '{}', NOW());
