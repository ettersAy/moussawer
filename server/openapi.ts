export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Moussawer API",
    version: "1.0.0",
    description: "API-first marketplace backend for web and future Android clients."
  },
  servers: [{ url: "/api/v1" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      ApiError: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: { type: "object" }
            }
          }
        }
      }
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: { "200": { description: "API is available" } }
      }
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a client or photographer",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                  role: { type: "string", enum: ["CLIENT", "PHOTOGRAPHER"] }
                }
              }
            }
          }
        },
        responses: { "201": { description: "Token and current user" } }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email and password",
        responses: { "200": { description: "Token and current user" }, "401": { description: "Invalid credentials" } }
      }
    },
    "/me": {
      get: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        summary: "Current authenticated user",
        responses: { "200": { description: "Current user" } }
      },
      patch: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        summary: "Update current user profile",
        responses: { "200": { description: "Updated user" } }
      }
    },
    "/categories": {
      get: {
        tags: ["Discovery"],
        summary: "List public categories",
        responses: { "200": { description: "Categories" } }
      }
    },
    "/photographers": {
      get: {
        tags: ["Discovery"],
        summary: "Search photographers",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "location", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "integer" } },
          { name: "maxPrice", in: "query", schema: { type: "integer" } },
          { name: "minRating", in: "query", schema: { type: "number" } },
          { name: "availabilityDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["rating", "price", "newest", "popularity"] } }
        ],
        responses: { "200": { description: "Paginated photographers" } }
      }
    },
    "/photographers/{identifier}": {
      get: {
        tags: ["Discovery"],
        summary: "Public photographer profile by id or slug",
        parameters: [{ name: "identifier", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Photographer profile" }, "404": { description: "Not found" } }
      }
    },
    "/photographers/{identifier}/availability": {
      get: {
        tags: ["Calendar"],
        summary: "Get available slots for a photographer",
        parameters: [
          { name: "identifier", in: "path", required: true, schema: { type: "string" } },
          { name: "date", in: "query", schema: { type: "string", format: "date" } },
          { name: "serviceId", in: "query", schema: { type: "string" } }
        ],
        responses: { "200": { description: "Availability slots" } }
      }
    },
    "/bookings": {
      get: {
        tags: ["Bookings"],
        security: [{ bearerAuth: [] }],
        summary: "List bookings visible to the current user",
        responses: { "200": { description: "Bookings" } }
      },
      post: {
        tags: ["Bookings"],
        security: [{ bearerAuth: [] }],
        summary: "Create a booking from an available slot",
        responses: {
          "201": { description: "Booking created" },
          "409": { description: "Unavailable or already reserved slot" },
          "422": { description: "Validation failure" }
        }
      }
    },
    "/bookings/{id}/status": {
      patch: {
        tags: ["Bookings"],
        security: [{ bearerAuth: [] }],
        summary: "Transition a booking status",
        responses: { "200": { description: "Updated booking" }, "422": { description: "Invalid transition" } }
      }
    },
    "/conversations": {
      get: {
        tags: ["Messaging"],
        security: [{ bearerAuth: [] }],
        summary: "List conversations",
        responses: { "200": { description: "Conversations" } }
      },
      post: {
        tags: ["Messaging"],
        security: [{ bearerAuth: [] }],
        summary: "Start or reuse a conversation",
        responses: { "201": { description: "Conversation" } }
      }
    },
    "/conversations/{id}/messages": {
      get: {
        tags: ["Messaging"],
        security: [{ bearerAuth: [] }],
        summary: "Read messages",
        responses: { "200": { description: "Messages" } }
      },
      post: {
        tags: ["Messaging"],
        security: [{ bearerAuth: [] }],
        summary: "Send a message",
        responses: { "201": { description: "Message" } }
      }
    },
    "/incidents": {
      get: { tags: ["Incidents"], security: [{ bearerAuth: [] }], summary: "List incidents", responses: { "200": { description: "Incidents" } } },
      post: { tags: ["Incidents"], security: [{ bearerAuth: [] }], summary: "Create incident", responses: { "201": { description: "Incident" } } }
    },
    "/disputes": {
      get: { tags: ["Disputes"], security: [{ bearerAuth: [] }], summary: "List disputes", responses: { "200": { description: "Disputes" } } },
      post: { tags: ["Disputes"], security: [{ bearerAuth: [] }], summary: "Create dispute", responses: { "201": { description: "Dispute" } } }
    },
    "/portfolio": {
      get: { tags: ["Portfolio"], summary: "List portfolio items", responses: { "200": { description: "Portfolio items" } } },
      post: { tags: ["Portfolio"], security: [{ bearerAuth: [] }], summary: "Create portfolio item", responses: { "201": { description: "Portfolio item" } } }
    },
    "/reviews": {
      post: {
        tags: ["Reviews"],
        security: [{ bearerAuth: [] }],
        summary: "Review a completed booking",
        responses: { "201": { description: "Review" }, "422": { description: "Booking not completed or already reviewed" } }
      }
    },
    "/notifications": {
      get: {
        tags: ["Notifications"],
        security: [{ bearerAuth: [] }],
        summary: "List current user's notifications",
        responses: { "200": { description: "Notifications" } }
      }
    },
    "/admin/stats": {
      get: {
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        summary: "Admin dashboard statistics",
        responses: { "200": { description: "Stats" }, "403": { description: "Admin only" } }
      }
    }
  }
};
